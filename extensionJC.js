var N_3 = [10, 10, 10];
var D1 = [5, 5, 5];
var D2 = [0, 0, 10];
var D3 = [0, 5, 10];
var N_2 = [10, 10];
var D4 = [5, 5];
var D5 = [0, 0];
var D6 = [0, 10];

// Algorithm to generate the hypotheses, namely the set partitions with prior_experiments elements.
var generateAllHypotheses = function(num_experiments, max_eq_classes) {
    if (max_eq_classes <= 0) {
        return undefined;
    }
    var baseHyp = [{
        'eq': [0],
        'mx': 0
    }];
    var genHyp = function(num_experiments, n, S) {
        if (n == num_experiments) {
            return S;
        }
        return genHyp(num_experiments, n + 1, [].concat.apply([], map(function(s) {
            return map(function(i) {
                var s_prev = s['eq'].concat(i);
                return {
                    'eq': s_prev,
                    'mx': _.max(s_prev)
                };
            }, _.range(_.min([s['mx'] + 2, max_eq_classes])));
        }, S)));
    };
    return map(function(i) {
        return i['eq'];
    }, genHyp(num_experiments, 1, baseHyp));
};

// Version: infers over hypotheses.

var marginalize2 = function(dist, i) {
    return Infer({
        method: "enumerate"
    }, function() {
        return sample(dist)[i];
    });
};

var returnPrediction = function(opts, encoding, prior_experiments, max_eq_classes) {
    var num_experiments = prior_experiments.length;
    return Infer(opts, function() {
        var eq_class_variables = map(function() {
            return uniform(0, 1);
        }, _.range(max_eq_classes));
        map(function(i) {
            observe(Binomial({
                p: eq_class_variables[encoding[i]],
                n: prior_experiments[i]['n']
            }), prior_experiments[i]['observed']);
        }, _.range(num_experiments));
        var pred = [];
        map(function(h_i) {
            pred.push(binomial(eq_class_variables[h_i], prior_experiments[h_i]['n']));
        }, encoding);
        return pred;
    });
};

// 0 0 1 1 2

// 0: 0
// 1: 5
// 2: 10

// generate

// 0 1 4 5 9

// 0 0 5 5 13 20 20
// 0 0 1 1 2 3 3
// 0 0 0 0 1 2 2
// 2.5 2.5 2.5 2.5 13 20 20

// {0:0, 1:5, 2:10, 3:arbitrary}

var recreateData = function(encoding, prior_experiments, max_eq_classes, index) {
    var num_experiments = prior_experiments.length;
    var get_prob = function(var_number) {
        var valid_indices = filter(function(i) {
            return encoding[i] == var_number;
        }, _.range(num_experiments));
        var observeds = sum(map(function(i) {
            return prior_experiments[i]['observed'];
        }, valid_indices));
        var ns = sum(map(function(i) {
            return prior_experiments[i]['n'];
        }, valid_indices));
        return observeds / ns;
    };

    var eq_class_probs = map(get_prob, _.range(max_eq_classes));

    var clusteredSample = function(index) {
        var dist = Binomial({
            p: eq_class_probs[encoding[index]],
            n: prior_experiments[index]['n']
        });
        sample(dist);
    };

    return map(clusteredSample, _.range(num_experiments))[index];
};

var getExperiment = function(encoding, prior_experiments, max_eq_classes) {
    var opts_experiment = {
        method: 'MCMC',
        samples: 20000,
        burn: 30000
    };
    //  return returnPrediction(opts_inner, observed_data, encoding.split(" "), num_experiments);
    return returnPrediction(opts_experiment, encoding, prior_experiments, max_eq_classes);
};

var study = function(prior_experiments, max_eq_classes) {
    var num_experiments = prior_experiments.length;
    var hypotheses = generateAllHypotheses(num_experiments, max_eq_classes);
    var opts_hypothesis = {
        method: 'enumerate'
    };
    return Infer(opts_hypothesis, function() {
        print("making encoding");
        var encoding = hypotheses[sample(RandomInteger({
            n: hypotheses.length
        }))];
        print(encoding);
        // ^  Sample a random valid hypothesis, length nParams, with eq_class_probs as
        // integers in [0,nParams].

        var experiment = getExperiment(encoding, prior_experiments, max_eq_classes);
        var m_preds = map(function(i) {
                marginalize2(experiment, i);
            },
            _.range(num_experiments));
        map(function(i) {
            observe(m_preds[i], prior_experiments[i]['observed']);
        }, _.range(num_experiments));

        return encoding;

    });
};

var visualizeStudy = function(observed_data, n_data, max_eq_classes) {
    print("Hypothesis probabilities based on data=[" + observed_data + ']:');
    var prior_experiments = map(function(x) {
        var k = {
            observed: x[0],
            n: x[1]
        };
        k;
    }, _.zip(observed_data, n_data));
    var s = study(prior_experiments, max_eq_classes);
    viz.hist(s);
    return s;
};

var opts_go = {
    method: 'MCMC',
    samples: 20000,
    burn: 30000
};

var arrayRecreateData = function(encoding, observed_data, n_data, max_eq_classes) {
    var prior_experiments = map(function(x) {
        var k = {
            observed: x[0],
            n: x[1]
        };
        k;
    }, _.zip(observed_data, n_data));
    var recreateDataDist = function(index) {
        return Infer({
            method: 'MCMC',
            samples: 20000,
            burn: 30000
        }, function() {
            return recreateData(encoding, prior_experiments, max_eq_classes, index);
        });
    };
    var generated_data = map(recreateDataDist, _.range(prior_experiments.length));
    return generated_data;
};

var megaBomb = function(observed_data, n_data, max_eq_classes) {
    var prior_experiments = map(function(x) {
        var k = {
            observed: x[0],
            n: x[1]
        };
        k;
    }, _.zip(observed_data, n_data));
    var s = study(prior_experiments, max_eq_classes);
    viz.hist(s);
    var dist_fields = s.toJSON();
    var encoding = dist_fields['support'][dist_fields['probs'].indexOf(_.max(dist_fields['probs']))];
    print("We are going with hypothesis " + encoding);
    var ds = arrayRecreateData(encoding, observed_data, n_data, max_eq_classes);
    return ds
        //     each(function(i) {viz.hist(s[i]);}, _.range(observed_data.length));
}

// visualizeStudy(D4, N_2);
// visualizeStudy([0, 1, 9, 10], [10, 10, 10, 10], 2);
// var s = megaBomb([0, 10], [10, 10], 2);
// var s = megaBomb([0, 1, 1, 4, 9, 9], [10, 10, 10, 10, 10, 10], 3);
var s = arrayRecreateData([0, 0, 0, 0, 1, 2, 2, 3], [0, 0, 1, 1, 4, 9, 9, 10], [10, 10, 10, 10, 10, 10, 10, 10], 4);
viz.hist(s[0]);
viz.hist(s[1]);
viz.hist(s[2]);
viz.hist(s[3]);
viz.hist(s[4]);
viz.hist(s[5]);
viz.hist(s[6]);
viz.hist(s[7]);
// visualizeStudy(D6, N_2, 3);

// visualizeStudy([0, 0], [1, 1]);
// visualizeStudy([0, 1], [1, 1], 3);

// generateAllHypotheses(3,1);

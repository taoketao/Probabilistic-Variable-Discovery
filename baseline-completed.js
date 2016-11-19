// Josh Cho, Morgan Bryant, 11/18/16
// Psych 204: Computation and Cognition, the Probabilistic Approach

// baseline-completed.js:  in this file, we implement and complete the 
// baseline proposal; see git.

var n1=10; var n2=10;


var marginalize = function(dist, key){
    return Infer({method: "enumerate"}, function(){
        return sample(dist)[key]
    })
}

var runExperiment = function(opts, datum, i, j) {
    return Infer(opts, function () {
        var p = [uniform(0,1), uniform(0,1), uniform(0,1)]
        observe(Binomial({p: p[i], n: n1}), datum[0]);
        observe(Binomial({p: p[j], n: n2}), datum[1]);
        var pred1 = binomial(p[i], n1)
        var pred2 = binomial(p[j], n2)
        return {'p1':p[i], 'p2':p[j], pred1:pred1, pred2:pred2}
    })
}

var getExperiment = function(h, datum) {
    var opts_inner = {method:'MCMC', samples:20000, burn:30000}    
    if (h=="H0") {
        return runExperiment(opts_inner, datum, 0, 0);
    } else if (h=="HA") {
        return runExperiment(opts_inner, datum, 1, 2);
    }
}

var study = function(datum) {
    return Infer({method:'enumerate'}, function() {
        var hypothesis = flip() ? 'H0' : 'HA';
        var experiment = getExperiment(hypothesis, datum);
        var m_pred1 = marginalize(experiment, 'pred1')
        var m_pred2 = marginalize(experiment, 'pred2')
        observe(m_pred1,datum[0])
        observe(m_pred2,datum[1])
        return hypothesis
    })
}

var visualizeStudy = function(trial) {
    print("H0 vs HA probabilities based on data=["+data[trial]+']:')
        var s = study(data[trial])
        viz.auto(s, {'ylabel':trial})
        return s;
}
map(function(i,j) {
    map(function(j) {
        if (i>j) return;
        print("Running program on data = "+i+", "+j+". Probability of H0:")
        var s = study([i,j])
        print(Math.exp(s.score("H0")))
    }, l1)
}, l1)
visualizeStudy(function([5,5])

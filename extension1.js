var N_3 = [10,10,10]
var D1  = [ 5, 5, 5]
var D2  = [ 0, 0,10]
var D3  = [ 0, 5,10]
var N_2 = [10,10]
var D4  = [ 5, 5]
var D5  = [ 0, 0]
var D6  = [ 0,10]

var marginalize2 = function(dist,i) {
  return Infer({
    method: "enumerate"
  }, function() {
    return sample(dist)[i];
  });
};

var runExperiment = function(opts, h, datum, N, numParams) {
  print("h:"+h)
  return Infer(opts, function() {
    var P = map(function(){return uniform(0,1)}, h)  
    map( function(i) {
      observe(Binomial({p:P[h[i]], n:N[i]}), datum[i])
    }, _.range(numParams))
    var pred = []
    map (function(h_i) {
      pred.push(binomial(P[h_i], N[h_i]))
    }, h)
    return pred;
  });
};

var getExperiment = function(h, datum, N, numParams) {
  var opts_inner = {
    method: 'MCMC',
    samples: 20000,
    burn: 30000
  };
  //  return runExperiment(opts_inner, datum, h.split(" "), numParams);
  return runExperiment(opts_inner, h, datum, N, numParams);
};

var study = function(datum, N) {
  var numParams = datum.length;
  return Infer({method: 'enumerate'}, function() {
    // For now use conditionals
    if (numParams==3) {
      var hypotheses = [[0,0,0], [0,0,1], [0,1,0], [1,0,0], [0,1,2]];
      var h = hypotheses[sample(RandomInteger({n: hypotheses.length}))];
      var experiment = getExperiment(h, datum, N, numParams);
      var m_preds = map(function(i) {marginalize2(experiment,i)},
                        _.range(numParams));
      map(function(i){
        observe(m_preds[i], datum[i])
      }, _.range(numParams))
      return h;
      
    } else if (numParams==2){
      var hypotheses = [[0,0], [0,1]];
      var h = hypotheses[sample(RandomInteger({n: hypotheses.length}))];
      var experiment = getExperiment(h, datum, N, numParams);
      var m_preds = map(function(i) {marginalize2(experiment,i)},
                        _.range(numParams));
      map(function(i){
        observe(m_preds[i], datum[i])
      }, _.range(numParams))

      return h;
    }
  });
};

var visualizeStudy = function(datum, N) {
  print("Hypothesis probabilities based on data=[" + datum + ']:');
  var s = study(datum, N);
  viz.hist(s);
  return s;
};


visualizeStudy(D4, N_2);
visualizeStudy(D5, N_2);
visualizeStudy(D6, N_2);

visualizeStudy(D1, N_3);
visualizeStudy(D2, N_3);
visualizeStudy(D3, N_3);

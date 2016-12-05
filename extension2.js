var N_3 = [10,10,10]
var D1  = [ 5, 5, 5]
var D2  = [ 0, 0,10]
var D3  = [ 0, 5,10]
var N_2 = [10,10]
var D4  = [ 5, 5]
var D5  = [ 0, 0]
var D6  = [ 0,10]

// Version: infers over hypotheses.

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
  var opts_experiment = {
    method: 'MCMC',
    samples: 2000,
    burn: 3000
  };
  //  return runExperiment(opts_inner, datum, h.split(" "), numParams);
  return runExperiment(opts_experiment, h, datum, N, numParams);
};



var study = function(datum, N) {
  var hypotheses = []

  
  var numParams = datum.length;
  var opts_hypothesis = {
    method:'enumerate'
  };
  return Infer(opts_hypothesis, function(){
    var h = map(
      function(j) {return sample(RandomInteger( {n: numParams}) )},
      _.range(numParams)
    )
   // ^  Sample a random valid hypothesis, length nParams, with values as 
   // integers in [0,nParams].
    
    condition(h[0]==0)
    map(function(k) {
      condition(_.some([
        _.some([map(function(l) {return h[k]==h[l]}, _.range(numParams))]),
        _.some([map(function(l) {return h[k]==h[l]+1}, _.range(numParams))]) ]))
    }, _.range(numParams))
    // ^ [faulty!] algorithm for eliminating redundant options.
    // faulty because it cannot find, say, [0,1,0].
     // A solution: condition either: h[i+1]==h[j] for i+1>j or
    // h[i+1]==h[j]+1 for *some* j.
    
    var experiment = getExperiment(h, datum, N, numParams);
    var m_preds = map(function(i) {marginalize2(experiment,i)},
                      _.range(numParams));
    map(function(i){
      observe(m_preds[i], datum[i])
    }, _.range(numParams))

    return h;

  });
};

var visualizeStudy = function(datum, N) {
  print("Hypothesis probabilities based on data=[" + datum + ']:');
  var s = study(datum, N);
  viz.hist(s);
  return s;
};

visualizeStudy(D1, N_3);
visualizeStudy(D2, N_3);
visualizeStudy(D3, N_3);

visualizeStudy(D4, N_2);
visualizeStudy(D5, N_2);
visualizeStudy(D6, N_2);


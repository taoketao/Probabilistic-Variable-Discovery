var N_3 = [10,10,10]
var D1  = [ 5, 5, 5]
var D2  = [ 0, 0,10]
var D3  = [ 0, 5,10]
var N_2 = [10,10]
var D4  = [ 5, 5]
var D5  = [ 0, 0]
var D6  = [ 0,10]

// Algorithm to generate the hypotheses, namely the set partitions with N elements.
var generateAllHypotheses = function(N) {
  var baseHyp = [ {'eq':[0],'mx':0} ]
  var genHyp = function(N,n,S) {
    if (n==N) { return S; }
    return genHyp(N,n+1, [].concat.apply([], map(function(s){
      return map(function(i){
        var s_prev = s['eq'].concat(i)
        return {'eq':s_prev, 'mx':_.max(s_prev)}
      }, _.range(s['mx']+2))
    }, S)));
  } 
  return map(function(i){return i['eq']}, genHyp(N,1,baseHyp))
}

// Version: infers over hypotheses.

var marginalize2 = function(dist,i) {
  return Infer({
    method: "enumerate"
  }, function() {
    return sample(dist)[i];
  });
};

var runExperiment = function(opts, h, datum, N, numParams) {
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
    samples: 20000,
    burn: 30000
  };
  //  return runExperiment(opts_inner, datum, h.split(" "), numParams);
  return runExperiment(opts_experiment, h, datum, N, numParams);
};

var study = function(datum, N) {
  var hypotheses = generateAllHypotheses(N.length);
  var numParams = datum.length;
  var opts_hypothesis = {
    method:'enumerate'
  };
  return Infer(opts_hypothesis, function(){
    print ("making h")
    var h = hypotheses[sample(RandomInteger( {n: hypotheses.length}) )]
    print(h)
   // ^  Sample a random valid hypothesis, length nParams, with values as 
   // integers in [0,nParams].
        
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

visualizeStudy([0,2,4,6],[6,6,6,6])
// visualizeStudy(D4, N_2);
// visualizeStudy(D5, N_2);
// visualizeStudy(D6, N_2);
visualizeStudy(D1, N_3);
visualizeStudy(D2, N_3);
visualizeStudy(D3, N_3);




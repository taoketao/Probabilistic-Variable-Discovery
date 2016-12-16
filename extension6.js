var sampleHypotheses = function(depth) {
  var baseHyp = [ {'eq':[0],'mx':0,'p':1} ]
  var genHyp = function(depth,n,S) {
    if (n==depth) { return S; }
    return genHyp(depth,n+1, [].concat.apply([], map(function(s){
      var opt_prob = s['p'] * (1.0/(s['mx']+2))
      return map(function(i){
        var s_prev = s['eq'].concat(i)
        return {'eq':s_prev, 'mx':_.max(s_prev), 'p':opt_prob}
      }, [randomInteger(s['mx']+2)])
    }, S)));
  } 
  var sampled_h = genHyp(depth,1,baseHyp)[0];
  return [sampled_h['eq'], sampled_h['p']]
}
var generateAllHypotheses = function(depth) {
  // Currently, this can only handle up to about 12 points due to exponential
  var baseHyp = [ {'eq':[0],'mx':0} ]
  var genHyp = function(depth,n,S) {
    if (n==depth) { return S; }
    return genHyp(depth,n+1, [].concat.apply([], map(function(s){
      return map(function(i){
        var s_prev = s['eq'].concat(i)
        return {'eq':s_prev, 'mx':_.max(s_prev)}
      }, _.range(s['mx']+2))
    }, S)));
  } 
  return map(function(i){return i['eq']}, genHyp(depth,1,baseHyp))
}

// old code for hypothesis testing:
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
    method: 'forward', samples:500
  };
  return runExperiment(opts_experiment, h, datum, N, numParams);
};

var study = function(datum, N, Enum) {
  var hypotheses = Enum ? generateAllHypotheses(N.length) : 
           map(function(){return sampleHypotheses(N.length)[0]}, _.range(30))
  var numParams = datum.length;
  var opts_hypothesis = {method:'enumerate'};
  return Infer(opts_hypothesis, function(){
    var h = hypotheses[sample(RandomInteger( {n: hypotheses.length}) )]
    var experiment = getExperiment(h, datum, N, numParams);
    var m_preds = map(function(i) {marginalize2(experiment,i)},
                      _.range(numParams));
    map(function(i){
      observe(m_preds[i], datum[i])
    }, _.range(numParams))
    return h;
  });
};

// New lossy recreating modelling code:

var makeRandomModel = function(n) {
  var hypotheses = generateAllHypotheses(n)
  print("Size of H class: "+hypotheses.length)
  return hypotheses[randomInteger(hypotheses.length)]
}

var makeDataFromModel = function(model,n,dataspace) {
  var centers = repeat(n, function(){return uniform(0,dataspace)})
  var data_truth = map(function(mi) {return centers[mi]}, model)
  return data_truth
}

var reduce_query = function(q) {
  var Q = []
  map(function(i){
    var P = sum(map(function(j) {
      return q[j].probs[i]
    }, _.range(q.length)))/q.length
    var S = q[0].support[i]
    Q.push([S, P])
  }, _.range(q[0].support.length))
  return Q
}

var test_lossy_recreation = function(n, noise_factor, addNoise, numObs) {
  var dataspace = 6;
  var N_vec = map(function(){return dataspace}, _.range(n))
  var H_star = makeRandomModel(n)
  var generated_data = makeDataFromModel(H_star, n, dataspace)
  print("H_star: "+H_star)
  print("True Data: "+generated_data)
  
  var Query_model = repeat(numObs, function() {
    var noisy_data = map(function(g){return Math.round(g)},generated_data)
    if (addNoise) {  
      var noisy_data = map(function(i){
        return Math.round(_.min([_.max([gaussian(i,noise_factor),0]),dataspace]))},
                           generated_data)
      print("Noisy Data: "+noisy_data)
    }
    var guess = study(noisy_data, N_vec, true)
    return guess
  })
  var guess_j = map(function(Q){return Q.toJSON()}, Query_model)
  var query_model = reduce_query(guess_j)
  print(query_model)
}

test_lossy_recreation(4, 0.5, true, 20)
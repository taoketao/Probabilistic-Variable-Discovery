// Make a hypothesis sampler.

var generateAllHypotheses = function(N) {
  // This can only handle up to about 12 points due to exponential growth by N.
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
var printH = function(H) {
  map(function(h) {print(h)}, H);
}
printH(generateAllHypotheses(3))

////////////////////////////////////////////////////////////////////

// helps undo the hypothesis sampling issue where 0..0 is most likely, etc
var debiasedSample = function(s) {
  var vs = _.range(2,s['mx']+4)
  var tot = sum(vs)
  var ps = map(function(i){return i/tot}, vs)
  return categorical({"ps":ps, "vs":_.range(s['mx']+2)})
}

var sampleHypotheses = function(N, debias) {
  var baseHyp = [ {'eq':[0],'mx':0,'p':1} ]
  var genHyp = function(N,n,S) {
    if (n==N) { return S; }
    return genHyp(N,n+1, [].concat.apply([], map(function(s){
      print(s)
      var nextSelection = debias ? debiasedSample(s) : 
                           randomInteger(_.range(s['mx']+2))
      var opt_prob = s['p'] * (1.0/(s['mx']+2))
      return map(function(i){
        var s_prev = s['eq'].concat(i)
        return {'eq':s_prev, 'mx':_.max(s_prev), 'p':opt_prob}
      }, [nextSelection])
    }, S)));
  } 
  var sampled_h = genHyp(N,1,baseHyp)[0];
  return [sampled_h['eq'], sampled_h['p']]
}


print(' ')
print(sampleHypotheses(4)[0])
print(' ')

var o1 = {method:'forward', samples:5000}
var o2 = {method:'enumerate'}
var o3 = {method:'MCMC', samples:10000}
var M = function(n){return sampleHypotheses(n)}

// var n = 5
viz(Infer(o1,function(){return sampleHypotheses(n, true)}))
viz(Infer(o2,function(){return sampleHypotheses(n, false)}))
viz(Infer(o3,function(){return sampleHypotheses(n, true)}))
//viz.hist(Infer(o2,function(){return sampleHypotheses(3)}))
var I = Infer(o2,function(){return sampleHypotheses(3)})

var getHypothesisSample = function(n, numSamps) {
  // This is simply querying the samples but with probabilities rectified 
  // for their (sampled) likelihood.  IE, 00...0 is the most likely sample, having
  // chance 2^-n, as is 00...01.
  var hypSampDist = Infer(o1,function(){return sampleHypotheses(n)}).toJSON();
  var tot = sum(map(function(i) {return i[1]}, hypSampDist['support']))
  print(n+': '+tot)
  var X = map(function(i) {return i[0]+' - '+i[1]}, hypSampDist['support']).sort()
  X.sort()
  map(function(o){print(o)},X.slice(0,20))
}

// map(function(i) {getHypothesisSample(i,0)}, _.range(2,25))
getHypothesisSample(20,0)
////////////////////////////////////////////////////////////////////


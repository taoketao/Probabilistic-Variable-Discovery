var debiasedSample = function(s,N) {
//   print(s['mx']+4)
  var vs = _.range(2,s['mx']+4)
//   print(vs)
  var tot = sum(vs)
//   print(tot)
//  var ps = map(function(i){return Math.pow(i/tot, N-s['mx']-1)}, vs)
  var ps = map(function(i){return i/tot}, vs)
//   print(ps)
//   print'-----------'
  return categorical({"ps":ps, "vs":_.range(s['mx']+2)})
}

var sampleHypotheses = function(N, debias) {
  var baseHyp = [ {'eq':[0],'mx':0,'p':1} ]
  var genHyp = function(N,n,S) {
    if (n==N) { return S; }
    return genHyp(N,n+1, [].concat.apply([], map(function(s){
      var nextSelection = (debias && n+1 < N) ? debiasedSample(s,N) : 
                           randomInteger(s['mx']+2)

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
// viz.hist(Infer({method:'enumerate'}, function() {return sampleHypotheses(3,true);}))
// viz.hist(Infer({method:'enumerate'}, function() {return sampleHypotheses(3,false);}))
viz.hist(Infer({method:'enumerate'}, function() {return sampleHypotheses(4,true);}))
var X = Infer({method:'enumerate'}, function() {return sampleHypotheses(7,true);}).toJSON()


map(function(i) {print(X.probs[i]+' : '+//X.support[i][0]+'];'+
                       sum(X.support[i][0])+',')},
    _.range(X.support.length))

// viz.hist(Infer({method:'enumerate'}, function() {return sampleHypotheses(4,false);}))
// viz.hist(Infer({method:'enumerate'}, function() {return sampleHypotheses(2,true);}))
// viz.hist(Infer({method:'enumerate'}, function() {return sampleHypotheses(2,false);}))
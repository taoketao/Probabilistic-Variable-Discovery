import numpy as np
import numpy.random
import matplotlib.pyplot as plt

x = np.random.randn(8873)
y = np.random.randn(8873)
print len(x), len(y)

heatmap, xedges, yedges = np.histogram2d(x, y, bins=50)
extent = [xedges[0], xedges[-1], yedges[0], yedges[-1]]


X = np.zeros((11,11))
X[0,0] = 0.6441601241301085
X[0,1] = 0.49524764050916914
X[0,2] = 0.3458432693643871
X[0,3] = 0.21710659493023277
X[0,4] = 0.11287289394304591
X[0,5] = 0.056983404402236315
X[0,6] = 0.03154935642594001
X[0,7] = 0.013030633538843834
X[0,8] = 0.0032772426581006947
X[0,9] = 0.0004372214837147799
X[0,10] = 0.00008816382522316984
X[1,1] = 0.5483414553532995
X[1,2] = 0.5297534855405235
X[1,3] = 0.44864934278977203
X[1,4] = 0.3361255341483568
X[1,5] = 0.2301066118949145
X[1,6] = 0.13913004529091622
X[1,7] = 0.07831728495171385
X[1,8] = 0.029502203917365907
X[1,9] = 0.008463841797090489
X[1,10] = 0.0010874331646276792
X[2,2] = 0.5673800752342758
X[2,3] = 0.5422629983489007
X[2,4] = 0.4534705290742913
X[2,5] = 0.3958553783606551
X[2,6] = 0.2954175960455562
X[2,7] = 0.17611401199365712
X[2,8] = 0.08908603552318398
X[2,9] = 0.032005860003320154
X[2,10] = 0.0032820187047976354
X[3,3] = 0.5782599060096618
X[3,4] = 0.520910615617532
X[3,5] = 0.4964695024655547
X[3,6] = 0.439448363228721
X[3,7] = 0.32274575378085235
X[3,8] = 0.16818331448145804
X[3,9] = 0.06227903286940073
X[3,10] = 0.014317526815955871
X[4,4] = 0.5884834562625968
X[4,5] = 0.5516778214292378
X[4,6] = 0.508624921825221
X[4,7] = 0.39730011997728043
X[4,8] = 0.3400682282432935
X[4,9] = 0.17237998334537868
X[4,10] = 0.033568448738822296
X[5,5] = 0.5816084503307339
X[5,6] = 0.5447329858024845
X[5,7] = 0.49038704086311813
X[5,8] = 0.4483578480548264
X[5,9] = 0.2629892206409857
X[5,10] = 0.06802901591524181
X[6,6] = 0.5305058059437118
X[6,7] = 0.5862906738865525
X[6,8] = 0.4590119598081776
X[6,9] = 0.3564248300209791
X[6,10] = 0.13330774312678761
X[7,7] = 0.5446035029895887
X[7,8] = 0.5314001611095112
X[7,9] = 0.3881319011454417
X[7,10] = 0.1996936593241031
X[8,8] = 0.5600157145743886
X[8,9] = 0.5175900565687116
X[8,10] = 0.3300245967781127
X[9,9] = 0.5878729347551253
X[9,10] = 0.4754952927985575
X[10,10] = 0.6065185262416035


for i in range(11):
    for j in range(i):
        X[i,j] = X[j,i]

plt.clf()
hm = plt.imshow(X, interpolation="nearest")
plt.xlabel("k1, out of n1=10")
plt.ylabel("k2, out of n2=10")
plt.title("Heatmap of probability of H0.")
plt.colorbar(hm)
plt.show()

import matplotlib.pyplot as plt; plt.rcdefaults()
import numpy as np
import pandas as pd
import matplotlib as m
import matplotlib.pyplot as plt

font = {'size': 50}

m.rc('font', **font)

df = pd.read_csv('../../../data/seattle-weather.csv')

# _df1 = df[['weather', 'wind']]
# _df1 = _df1.groupby(['weather'], as_index=False).mean()

# bar_widths = _df1['wind'].to_numpy()

# plt.barh(np.arange(len(_df1['weather'].to_numpy())), _df1['wind'].to_numpy(), align='center', zorder=3)
# plt.yticks(np.arange(len(_df1['weather'].to_numpy())), _df1['weather'].to_numpy())
# plt.xlabel('Avg., wind')
# plt.ylabel('Weather')
# plt.xlim([0, 8])
# plt.rcParams['svg.fonttype'] = 'none'
# plt.tight_layout()
# plt.grid(zorder=0, linewidth=0.3)

# plt.savefig('bars1.svg')

plt.clf()
_df = df[['weather', 'precipitation']]
# _df = df[(df['weather'] == 'rain') | (df['weather'] == 'snow')]
_df = _df.groupby(['weather'], as_index=False).sum()

bar_widths = _df['precipitation'].to_numpy()

plt.figure(figsize=(30, 10))
plt.barh(np.arange(len(_df['weather'].to_numpy())), _df['precipitation'].to_numpy(), align='center', zorder=3)
plt.yticks(np.arange(len(_df['weather'].to_numpy())), _df['weather'].to_numpy())
plt.xlabel('Sum, precipitation')
plt.ylabel('Weather')
plt.rcParams['svg.fonttype'] = 'none'
plt.tight_layout()
plt.grid(zorder=0, linewidth=0.4)
plt.savefig('bars_test.svg')

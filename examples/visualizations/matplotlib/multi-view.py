import matplotlib.pyplot as plt; plt.rcdefaults()
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('../../data/seattle-weather.csv')

_df = df[['weather', 'temp_max']]
_df = _df.groupby(['weather'], as_index=False).count()

bar_widths = _df['temp_max'].to_numpy()

plt.barh(np.arange(len(_df['weather'].to_numpy())), _df['temp_max'].to_numpy(), align='center', zorder=3)
plt.yticks(np.arange(len(_df['weather'].to_numpy())), _df['weather'].to_numpy())
plt.xlabel('# of Records')
plt.ylabel('Weather')
plt.rcParams['svg.fonttype'] = 'none'
plt.tight_layout()
plt.grid(zorder=0, linewidth=0.4)
# plt.savefig('bars1.svg')

plt.clf()
_df = df[['weather', 'temp_max']]
_df = df[(df['weather'] == 'rain') | (df['weather'] == 'snow')]
_df = _df.groupby(['weather'], as_index=False).std()

bar_widths = _df['temp_max'].to_numpy()

plt.barh(np.arange(len(_df['weather'].to_numpy())), _df['temp_max'].to_numpy(), align='center', zorder=3)
plt.yticks(np.arange(len(_df['weather'].to_numpy())), _df['weather'].to_numpy())
plt.xlabel('Std temp_max')
plt.ylabel('Weather')
plt.rcParams['svg.fonttype'] = 'none'
plt.tight_layout()
plt.grid(zorder=0, linewidth=0.4)
plt.savefig('bars2.svg')

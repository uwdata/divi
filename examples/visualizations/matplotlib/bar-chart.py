import matplotlib.pyplot as plt; plt.rcdefaults()
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('../../data/seattle-weather.csv')
df = df[['weather', 'temp_max']]
df = df.groupby(['weather'], as_index=False).sum()

bar_widths = df['temp_max'].to_numpy()


plt.barh(np.arange(len(df['weather'].to_numpy())), df['temp_max'].to_numpy(), align='center')
plt.yticks(np.arange(len(df['weather'].to_numpy())), df['weather'].to_numpy())
plt.xlabel('Sum of maximum temp.')
plt.ylabel('Weather')
plt.rcParams['svg.fonttype'] = 'none'
plt.grid()
plt.savefig('bars.svg')

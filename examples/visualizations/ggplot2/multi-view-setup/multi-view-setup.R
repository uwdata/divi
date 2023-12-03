library(ggplot2)
library(svglite)
library(tidyverse)
# theme_set(theme_minimal())
theme_set(theme_gray() + theme(legend.key=element_blank())) 

X <- read.csv(url("https://vega.github.io/vega-datasets/data/seattle-weather.csv"))
X$date <- as.Date(X$date, format="%Y-%m-%d")
X$cycle <- as.Date(format(X$date, format="%b %d"), format='%b %d')
X <- na.omit(X)
library(lubridate)
year(X$cycle) <- 1990
X
scatter1 <- ggplot(X, aes(x = temp_max, y = precipitation, color = weather)) + 
  geom_point(size=10) +
  # geom_point(aes(size=precipitation)) +
  # scale_x_date(date_labels = "%Y-%m-%d") +
  # ggtitle('Seattle Weather Data 2012-2015') +
  ylab('Precip. (in.)') + 
  xlab('Max. temp') +
  theme(plot.title = element_text(size=50)) +
  theme(axis.text = element_text(size=40)) +
  theme(axis.title = element_text(size=35)) +
  theme(legend.title = element_text(size=35)) +
  theme(legend.text = element_text(size=40)) + 
  theme(legend.key.size = unit(5, 'cm')) + 
  theme(legend.spacing.x = unit(0.5, 'cm')) +
  theme(legend.position = 'right') +
  guides(colour = guide_legend(title = 'Weather', override.aes = list(size=10)))
  # theme(legend.justification = 'top')
scatter1

write.csv(X, '~/GitHub/divi/examples/data/seattle-weather.csv', row.names=FALSE)
ggsave(file="~/GitHub/divi/examples/visualizations/ggplot2/multi-view-setup/scatter.svg", plot=scatter1, width=40, height=15)

X2 <- X
X2$cycle <- format(X2$cycle, format='%b %d')
X2 <- X2 %>%
  group_by(cycle) %>%
  summarise(precipitation = mean(precipitation)) 

X2$cycle <- as.Date(X2$cycle, format='%b %d')

scatter2 <- ggplot(X2, aes(x = cycle, y = precipitation)) + 
  geom_line(aes()) +
  # geom_point(aes(size=precipitation)) +
  scale_x_date(date_labels = "%b %d") +
  ggtitle('Seattle Weather Data 2012-2015') +
  xlab('Date') + 
  ylab('Daily Avg. Precipitation (in.)') +
  theme(plot.title = element_text(size=20)) +
  theme(axis.text = element_text(size=12)) +
  theme(axis.title = element_text(size=15)) +
  theme(legend.title = element_text(size=15)) +
  theme(legend.text = element_text(size=15)) + 
  theme(legend.key.size = unit(1, 'cm')) + 
  guides(colour = guide_legend(title = 'Weather', override.aes = list(size=3)))
# theme(legend.justification = 'top')
scatter2

ggsave(file="~/GitHub/divi/examples/visualizations/ggplot2/multi-view-setup/line.svg", plot=scatter2, width=10.75, height=6)

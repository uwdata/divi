library(ggplot2)
library(svglite)
library(tidyverse)
theme_set(theme_minimal())

X <- read.csv(url("https://vega.github.io/vega-datasets/data/seattle-weather.csv"))
X$date <- as.Date(X$date,format="%Y-%m-%d")

X1 <- X %>%
  filter(weather == "rain")
# X

image <- ggplot(X1, aes(x = date, y = temp_max)) + 
  geom_point() +
  scale_x_date(date_labels = "%b %Y")
  #ggtitle('Rain')
image
# image <- ggplot(X, aes(x = date, y = price, group = symbol, color = symbol)) + 
#  geom_line() +
#  scale_x_date(date_labels = "%b %d %Y")
# ggsave(file="weather-scatter.svg", plot=image, width=12, height=7)
# ggsave(file="weather-scatter2.svg", plot=image, width=14, height=8)

ggsave(file="weather-scatter3.svg", plot=image, width=12, height=6)

X2 <- X %>%
  filter(weather == "sun")

image <- ggplot(X1, aes(x = date, y = temp_min)) + 
  geom_point() +
  scale_x_date(date_labels = "%b %Y") 
#  ggtitle('Sun')
image
ggsave(file="weather-scatter4.svg", plot=image, width=12, height=6)

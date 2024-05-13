---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
    text: |
        Dynamically Interactive Visualization
    tagline: |
        DIVI automatically orchestrates interactions within and across SVG visualizations. 
        NOTE: This page is in the process of being updated.
    actions:
        - theme: brand
          text: What is DIVI?
          link: /what-is-mosaic/
        - theme: alt
          text: Get started
          link: /get-started/
        - theme: alt
          text: Examples
          link: /examples/
        - theme: alt
          text: GitHub
          link: 'https://github.com/uwdata/divi'

features:
    - 
      title: Interact with charts automatically
      details: Explore charts on-the-fly without writing complex interaction handling code.
    - 
      title: Perform a useful range of supported interactions
      details: Analyze data via selection & brushing, navigation, filtering, annotation, and sorting.
    - 
      title: Interoperable across source tools and chart types
      details: Interact with any visualization in SVG format, including charts from popular analysis tools such as Matplotlib, ggplot2, and Excel. This includes linked views, too!
    - 
      title: Reuse chart deconstructors
      details: DIVI parses and analyzes charts to infer core structures and relationships needed for interactions (e.g., axes, legends, marks), which are exposed for any user-desired rigging.
---

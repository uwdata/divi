// Interactions
export const Select = 'select';
export const Zoom = 'zoom';
export const Pan = 'pan';
export const Filter = 'filter';
export const Sort = 'sort';
export const Brush = 'brush';
export const Annotate = 'annotate';
export const Arrange = 'arrange';

// Interaction defaults
export const SelectOpacity = 1;
export const UnselectOpacity = 0.1;
export const OpacityField = '_opacity_';
export const SelectField = '_selected_';

// Chart components
export const DefaultSvgId = 'svgPlot';
export const Axis = 'axis';
export const Tick = 'tick';
export const TickDomain = 'domain';
export const Background = 'background';
export const Foreground = 'foreground';
export const markTypes = [
    'circle', 'ellipse', 'line', 'polygon', 'polyline', 'rect', 'path', 'use'
];

// Custom view fields
export const CenterX = 'centerX';
export const CenterY = 'centerY';
export const vertAlign = ['left', 'right', CenterX];
export const horizAlign = ['top', 'bottom', CenterY];

// Legend and title constants
export const SizeLegend = 'size';
export const CategoricalColorLegend = 'colorCat';
export const DataAttr = '_inferred_data_';

export const RoleProperty = '_role_';
export const LegendRole = 'legend';
export const AxisDomainRole = 'axis-domain';
export const TitleRole = 'title';
export const OrphanTickRole = 'orphan-tick';
export const MarkRole = 'mark';

export const tableMarkField = '_mark_';
export const tableIndexField = '_I_';
export const tableGroupIndexField = '_gI_';

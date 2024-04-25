import { select } from '../../node_modules/d3-selection/src/index.js';
import {
    TEST_LEGEND_LABEL, TEST_LEGEND_MARK, TEST_LEGEND_TITLE, TEST_MARK,
    TEST_TITLE, TEST_X_AXIS_LABEL, TEST_X_AXIS_TICK, TEST_X_AXIS_TITLE,
    TEST_Y_AXIS_LABEL, TEST_Y_AXIS_TICK, TEST_Y_AXIS_TITLE
} from './test-constants.js';

export function testChartMetadata(divi) {
    testProperties(divi);
    testAxes(divi);
    testLegends(divi);
    testMarks(divi);
}

function testProperties(divi) {
    describe('Global Properties', function() {
        it('Should infer chart SVG container', function() {
            const { metadatas, groundMetadatas } = divi;

            for (let i = 0; i < metadatas.length; ++i) {
                const metadata = metadatas[i];
                const groundMetadata = groundMetadatas[i];

                const { chart: groundChart } = groundMetadata;
                const { svg: inferredChart } = metadata;

                chai.assert.deepEqual(groundChart, inferredChart);
            }
        });

        it('Should infer chart title', function() {
            const { metadatas, groundMetadatas } = divi;

            for (let i = 0; i < metadatas.length; ++i) {
                const metadata = metadatas[i];
                const groundMetadata = groundMetadatas[i];

                const { chart: groundChart } = groundMetadata;
                const { title: inferredTitle } = metadata;
                const groundTitle = select(groundChart).select('.' + TEST_TITLE);

                if (groundTitle.empty()) {
                    chai.should(inferredTitle).equal(undefined);
                } else {
                    chai.assert.deepEqual(groundTitle.node(), inferredTitle);
                }
            }
        });
    });
}

function testAxes(divi) {
    describe('Axes', function() {
        describe('x-axis', function() {
            it('Should infer x-axis labels', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { chart: groundChart } = groundMetadata;
                    const { xAxis: axis } = metadata;
                    const { ticks } = axis;

                    const groundLabels = select(groundChart).selectAll('.' + TEST_X_AXIS_LABEL).nodes();
                    const inferredLabels = ticks.map(t => t.label).filter(
                        d => d !== undefined && d !== null
                    );

                    chai.assert.sameDeepMembers(groundLabels, inferredLabels);
                }
            });

            it('Should infer x-axis ticks', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { chart: groundChart } = groundMetadata;
                    const { xAxis: axis } = metadata;
                    const { ticks } = axis;

                    const groundTicks = select(groundChart).selectAll('.' + TEST_X_AXIS_TICK).nodes();
                    const inferredTicks = ticks.map(t => t.marks).flat();

                    chai.assert.sameDeepMembers(groundTicks, inferredTicks);
                }
            });

            it('Should infer x-axis title', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { chart: groundChart } = groundMetadata;
                    const groundTitle = select(groundChart).select('.' + TEST_X_AXIS_TITLE);

                    const { xAxis: axis } = metadata;
                    const { title: inferredTitle } = axis;

                    if (groundTitle.empty()) {
                        chai.should(inferredTitle).equal(undefined);
                    } else {
                        chai.assert.deepEqual(groundTitle.node(), inferredTitle);
                    }
                }
            });

            it('Should infer x-axis domain', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { xAxis: groundAxis } = groundMetadata;
                    const { domain: groundDomain } = groundAxis;

                    const { xAxis: axis } = metadata;
                    const { domain: inferredDomain } = axis;

                    chai.assert.sameDeepMembers(groundDomain, inferredDomain);
                }
            });

            it('Should infer x-axis type', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { xAxis: groundAxis } = groundMetadata;
                    const { ordinal: groundOrdinal } = groundAxis;

                    const { xAxis: axis } = metadata;
                    const { ordinal: inferredOrdinal } = axis;

                    chai.assert.sameDeepMembers(groundOrdinal, inferredOrdinal);
                }
            });

            it('Should infer x-axis tick values', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { xAxis: groundAxis } = groundMetadata;
                    const { tickValues: groundTickValues } = groundAxis;

                    const { xAxis: axis } = metadata;
                    const { ticks } = axis;
                    const inferredTickValues = ticks.map(t => t.value).filter(
                        d => d !== undefined && d !== null
                    );

                    chai.assert.sameDeepMembers(groundTickValues, inferredTickValues);
                }
            });
        });

        describe('y-axis', function() {
            it('Should infer y-axis labels', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { chart: groundChart } = groundMetadata;
                    const { yAxis: axis } = metadata;
                    const { ticks } = axis;

                    const groundLabels = select(groundChart).selectAll('.' + TEST_Y_AXIS_LABEL).nodes();
                    const inferredLabels = ticks.map(t => t.label).filter(
                        d => d !== undefined && d !== null
                    );

                    chai.assert.sameDeepMembers(groundLabels, inferredLabels);
                }
            });

            it('Should infer y-axis ticks', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { chart: groundChart } = groundMetadata;
                    const { yAxis: axis } = metadata;
                    const { ticks } = axis;

                    const groundTicks = select(groundChart).selectAll('.' + TEST_Y_AXIS_TICK).nodes();
                    const inferredTicks = ticks.map(t => t.marks).flat();

                    chai.assert.sameDeepMembers(groundTicks, inferredTicks);
                }
            });

            it('Should infer y-axis title', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { chart: groundChart } = groundMetadata;
                    const groundTitle = select(groundChart).select('.' + TEST_Y_AXIS_TITLE);

                    const { yAxis: axis } = metadata;
                    const { title: inferredTitle } = axis;

                    if (groundTitle.empty()) {
                        chai.should(inferredTitle).equal(undefined);
                    } else {
                        chai.assert.deepEqual(groundTitle.node(), inferredTitle);
                    }
                }
            });

            it('Should infer y-axis domain', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { yAxis: groundAxis } = groundMetadata;
                    const { domain: groundDomain } = groundAxis;

                    const { yAxis: axis } = metadata;
                    const { domain: inferredDomain } = axis;

                    chai.assert.sameDeepMembers(groundDomain, inferredDomain);
                }
            });

            it('Should infer y-axis type', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { yAxis: groundAxis } = groundMetadata;
                    const { ordinal: groundOrdinal } = groundAxis;

                    const { yAxis: axis } = metadata;
                    const { ordinal } = axis;

                    chai.assert.sameDeepMembers(ordinal, groundOrdinal);
                }
            });

            it('Should infer y-axis tick values', function() {
                const { metadatas, groundMetadatas } = divi;

                for (let i = 0; i < metadatas.length; ++i) {
                    const metadata = metadatas[i];
                    const groundMetadata = groundMetadatas[i];

                    const { yAxis: groundAxis } = groundMetadata;
                    const { tickValues: groundTickValues } = groundAxis;

                    const { yAxis: axis } = metadata;
                    const { ticks } = axis;
                    const inferredTickValues = ticks.map(t => t.value).filter(
                        d => d !== undefined && d !== null
                    );

                    chai.assert.sameDeepMembers(groundTickValues, inferredTickValues);
                }
            });
        });
    });
}

function testLegends(divi) {
    describe('Legends', function() {
        it('Should infer legend labels', function() {
            const { metadatas, groundMetadatas } = divi;

            for (let i = 0; i < metadatas.length; ++i) {
                const metadata = metadatas[i];
                const groundMetadata = groundMetadatas[i];

                const { chart: groundChart } = groundMetadata;
                const groundLegendLabels = select(groundChart).selectAll('.' + TEST_LEGEND_LABEL);

                const { legends } = metadata;
                const inferredLegendLabels = legends.map(d => d.marks.map(m => m.label)).flat();

                if (groundLegendLabels.empty()) {
                    chai.assert.strictEqual(inferredLegendLabels.length, 0);
                } else {
                    chai.assert.deepEqual(groundLegendLabels.nodes(), inferredLegendLabels);
                }
            }
        });

        it('Should infer legend marks', function() {
            const { metadatas, groundMetadatas } = divi;

            for (let i = 0; i < metadatas.length; ++i) {
                const metadata = metadatas[i];
                const groundMetadata = groundMetadatas[i];

                const { chart: groundChart } = groundMetadata;
                const groundLegendMarks = select(groundChart).selectAll('.' + TEST_LEGEND_MARK);

                const { legends } = metadata;
                const inferredLegendMarks = legends.map(d => d.marks.map(m => m.mark)).flat();

                if (groundLegendMarks.empty()) {
                    chai.assert.strictEqual(inferredLegendMarks.length, 0);
                } else {
                    chai.assert.deepEqual(groundLegendMarks.nodes(), inferredLegendMarks);
                }
            }
        });

        it('Should infer legend title', function() {
            const { metadatas, groundMetadatas } = divi;

            for (let i = 0; i < metadatas.length; ++i) {
                const metadata = metadatas[i];
                const groundMetadata = groundMetadatas[i];

                const { chart: groundChart } = groundMetadata;
                const groundTitles = select(groundChart).selectAll('.' + TEST_LEGEND_TITLE);

                const { legends } = metadata;
                const inferredLegendTitles = legends.map(d => d.title);

                if (groundTitles.empty()) {
                    chai.assert.strictEqual(inferredLegendTitles.length, 0);
                } else {
                    chai.assert.deepEqual(groundTitles.nodes(), inferredLegendTitles);
                }
            }
        });
    });
}

function testMarks(divi) {
    describe('Marks', function() {
        it('Should infer marks', function() {
            const { metadatas, groundMetadatas } = divi;

            for (let i = 0; i < metadatas.length; ++i) {
                const metadata = metadatas[i];
                const groundMetadata = groundMetadatas[i];

                const { chart: groundChart } = groundMetadata;
                const { svgMarks: inferredMarks } = metadata;
                const groundMarks = select(groundChart).selectAll('.' + TEST_MARK).nodes();

                chai.assert.sameDeepMembers(groundMarks, inferredMarks);
            }
        });
    });
}

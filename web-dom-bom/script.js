import data from './data.js';

const CONTAINER_BLOCK = document.getElementById('container');
const CITIES_BLOCK = document.getElementById('cities');
const SELECT_ALL = document.getElementById('select-all');
const SELECTOR = document.getElementById('selector');
const COLORS = ['#c516c5', '#6565dc', '#07cae1', '#1d277c', '#ecab04'];
const CHART_Y_STEP = 70;
const CHART_X_STEP = 80;
const MIN_BLOCK_HEIGHT = 10;
CONTAINER_BLOCK.classList.add('container')

const createSVGElement = (tag, parentNode, attrs = {}, text = '') => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).length && Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value))
    text && element.append(text);
    parentNode.append(element);
    return element;
}

const createHTMLElement = (tag, parentNode, attrs = {}) => {
    const element = document.createElement(tag);
    Object.keys(attrs).length && Object.entries(attrs).forEach(([key, value]) => element[key] = value)
    parentNode.append(element);
    return element;
}

const getChartTitle = (val) => `Середні зарплати ${val} розробників в Україні за опитуванням DOU червень-липень 2020`;
const svgBarChart = createSVGElement('svg', CONTAINER_BLOCK, {class: 'graph'});
const svgChartCoords = svgBarChart.getBoundingClientRect();
const header = createSVGElement('text', svgBarChart, {
        class: "graph__header",
        x: svgChartCoords.width / 2,
        y: CHART_X_STEP / 2
    },
    getChartTitle(SELECTOR.value))

for (let i = CHART_Y_STEP, j = 100; i <= svgChartCoords.height - CHART_Y_STEP, j >= 0; i += 52, j -= 10) {
    createSVGElement('line', svgBarChart, {
        x1: CHART_X_STEP,
        x2: svgChartCoords.width - CHART_X_STEP,
        y1: i,
        y2: i,
        class: 'grid-line'
    })

    createSVGElement('text', svgBarChart, {
        x: CHART_X_STEP - CHART_X_STEP / 2,
        y: i,
        class: 'grid-bg'
    }, j.toString())
}

for (let i = CHART_X_STEP, j = 0; i <= svgChartCoords.width - CHART_X_STEP, j <= 10; i += CHART_X_STEP, j++) {
    createSVGElement('text', svgBarChart, {
        x: j ? i + 30 : i - 10,
        y: svgChartCoords.height - CHART_Y_STEP + CHART_X_STEP / 4,
        class: 'grid-bg',
        id: j,
    }, !j ? 'less than a year' : j)
}

const axisX = createSVGElement('line', svgBarChart, {
    x1: CHART_X_STEP,
    x2: svgChartCoords.width - CHART_X_STEP + CHART_X_STEP / 4,
    y1: svgChartCoords.height - CHART_Y_STEP,
    y2: svgChartCoords.height - CHART_Y_STEP,
    class: 'grid'
})
const axisY = createSVGElement('line', svgBarChart, {
    x1: CHART_X_STEP,
    x2: CHART_X_STEP,
    y1: CHART_Y_STEP,
    y2: svgChartCoords.height - CHART_Y_STEP,
    class: 'grid'
})

const evaluatePosition = (pos) => {
    switch (true) {
        case pos.includes('Junior'):
            return 10;
        case pos.includes('Senior'):
            return 20;
        case pos.includes('Lead'):
            return 30;
        case pos.includes('Architect'):
        case pos.includes('Manager'):
            return 40;
        default:
            return 15;
    }
}

const renderCitiesBlock = () => {
    const cities = new Set();
    data.forEach(form => cities.add(form[1]));
    Array.from(cities)
        .sort((a, b) => a.localeCompare(b))
        .forEach(city => {
            const li = createHTMLElement('li', CITIES_BLOCK)
            const checkbox = createHTMLElement('input', li, {
                type: 'checkbox',
                checked: true,
                className: 'cities__list',
                value: city
            });

            createHTMLElement('label', li, {textContent: city})
            checkbox.addEventListener('change', () => render());
        })

    return document.querySelectorAll('.cities__list');
}

const lists = renderCitiesBlock();
const getSelectedCities = () => {
    const selectedCities = [];
    lists.forEach(el => {
        if (el.checked) {
            selectedCities.push(el.value)
        }
    });

    if (!selectedCities.length) {
        lists.forEach(el => selectedCities.push(el.value))
    }

    return selectedCities;
}

const getDataForChart = (value, cities) => {
    const positions = new Set();
    const result = data
        .filter(form => {
            const filteredBy = form[7] || form[8]
            const city = form[1];

            if (filteredBy === value && cities.includes(city)) {
                return form
            }
        })
        .reduce((total, current) => {
            positions.add(current[4])
            const exp = current[5] < 1 ? 0 : current[5];
            total[exp] ? total[exp].push(current) : total[exp] = [current];
            return total;
        }, {})

    const positionsVsColors = Array.from(positions)
        .sort((a, b) => evaluatePosition(a) - evaluatePosition(b))
        .reduce((total, current, i) => {
            total[i] = [current, COLORS[i]]
            return total
        }, [])

    return {result, positions: positionsVsColors}
}

const getMedian = (group) => {
    const index = group.length / 2;
    if (!Number.isInteger(index)) {
        return group[Math.floor(index)][2]
    }
    const lower = group[index - 1];
    const upper = group[index];
    return Math.round((lower[2] + upper[2]) / 2);
}

const getChartDescription = (group) => {
    const getAverageSalary = (arr) => {
        const sum = arr.reduce((total, curr) => total + curr[2], 0);
        return (sum / arr.length).toFixed(0);
    }

    const getNQuartile = (quartile, group) => {
        if (group.length <= 1) {
            return group[0][2]
        }
        const idx = quartile * (group.length - 1) / 100;
        const intPart = Math.trunc(idx);
        const floatedPart = idx - intPart;
        const res = group[intPart][2] + floatedPart * (group[intPart + 1][2] - group[intPart][2])
        return res.toFixed()
    }

    const sortedGroup = group.sort((a, b) => a[2] - b[2]);
    const min = sortedGroup[0][2];
    const max = sortedGroup[sortedGroup.length - 1][2];
    const mean = getAverageSalary(sortedGroup);
    const median = getMedian(sortedGroup);
    const number = group.length;
    const quartile10 = getNQuartile(10, group);
    const quartile25 = getNQuartile(25, group);
    const quartile75 = getNQuartile(75, group);
    const quartile90 = getNQuartile(90, group);

    return {
        min, max, mean, median, number,
        quartile10, quartile25, quartile75, quartile90
    }
}

const renderChartInfoOnHover = (parentCordX, parentCordY, rectWidth, groupInfo) => {
    const ROW_STEP = 14;
    const renderInfoText = (title, x, y) => createSVGElement('text', group, {
        x, y, class: 'details__text'
    }, title);
    const renderDashedLine = (offset) => createSVGElement('line', group, {
        x1: startX + 6,
        x2: startX + rectWidth,
        y1: parentCordY + 8 * ROW_STEP + offset,
        y2: parentCordY + 8 * ROW_STEP + offset,
        class: 'grid-dashed'
    })
    const group = createSVGElement('g', svgBarChart, {id: 'details', class: 'graph__details'})
    const startX = parentCordX + rectWidth / 2;
    createSVGElement('rect', group, {
        x: startX,
        y: parentCordY,
        width: 140,
        height: 150,
        class: 'graph__details-border'
    });

    renderInfoText(`Min: ${groupInfo.min}$`, startX + 5, parentCordY + ROW_STEP);
    renderInfoText(`10th Quartile: ${groupInfo.quartile10}$`, startX + 5, parentCordY + 2 * ROW_STEP);
    renderInfoText(`25th Quartile: ${groupInfo.quartile25}$`, startX + 5, parentCordY + 3 * ROW_STEP);
    renderInfoText(`Median: ${groupInfo.median}$`, startX + 5, parentCordY + 4 * ROW_STEP);
    renderInfoText(`Mean: ${groupInfo.mean}$`, startX + 5, parentCordY + 5 * ROW_STEP);
    renderInfoText(`75th Quartile: ${groupInfo.quartile75}$`, startX + 5, parentCordY + 6 * ROW_STEP);
    renderInfoText(`90th Quartile: ${groupInfo.quartile90}$`, startX + 5, parentCordY + 7 * ROW_STEP);
    renderInfoText(`Max: ${groupInfo.max}$`, startX + 5, parentCordY + 8 * ROW_STEP);
    renderDashedLine(7);
    renderDashedLine(12);
    renderInfoText(`Number: ${groupInfo.number}`, startX + 5, parentCordY + 10 * ROW_STEP);
}

const createChartColumn = (data, positions, colXStart) => {
    const colHeight = svgChartCoords.height - 2 * CHART_Y_STEP;
    const colForms = data.length;
    let colYStart = 0;

    const group = data
        .reduce((total, current) => {
            const position = current[4];
            total[position] ? total[position].push(current) : total[position] = [current]
            return total;
        }, {})

    Object.entries(group)
        .sort(([currKey], [nextKey]) => evaluatePosition(nextKey) - evaluatePosition(currKey))
        .forEach(([key, data]) => {
            const heightPercentage = 100 * data.length / colForms;
            const chartBlockHeight = colHeight * heightPercentage / 100;
            const [, color] = positions.find(el => el[0] === key)
            renderColumnElement(data, colForms, colXStart, colYStart, chartBlockHeight, color);
            colYStart += chartBlockHeight
        })
}

const renderColumnElement = (currentGroup, colFormsCount, x, y, height, color) => {
    const groupInfo = getChartDescription(currentGroup);
    const group = createSVGElement('g', chartBlock);
    const rect = createSVGElement('rect', group, {
        x: x,
        y: CHART_Y_STEP + y - 1,
        width: CHART_X_STEP - 15,
        height: height,
        fill: color,
    })
    const rectCoords = rect.getBoundingClientRect();

    if (height >= MIN_BLOCK_HEIGHT) {
        const text = createSVGElement('text', group, {
            y: y + height / 2 + CHART_Y_STEP + 5,
            class: 'graph__text'
        }, `${groupInfo.mean}$`)
        const textCoords = text.getBoundingClientRect()
        const textCenter = x + (rectCoords.width - textCoords.width) / 2;
        text.setAttribute('x', textCenter)
    }

    group.addEventListener('mouseenter', e => {
        renderChartInfoOnHover(x, e.offsetY, rectCoords.width, groupInfo)
    })

    group.addEventListener('mouseleave', () => {
        const element = CONTAINER_BLOCK.querySelector('#details');
        element.remove()
    })
}

const createChartPositionLegend = (parentNode, positionInfo, xStart) => {
    const group = createSVGElement('g', parentNode);
    createSVGElement('rect', group, {
        fill: positionInfo[1],
        y: svgChartCoords.height - CHART_Y_STEP / 2,
        x: xStart,
        width: 25,
        height: 25,
        rx: 8,
        ry: 8,
    });

    createSVGElement('text', group, {
        x: xStart + 30,
        y: svgChartCoords.height - CHART_Y_STEP / 2 + 16,
        class: 'graph__text'
    }, positionInfo[0]);
}

const renderChartPositions = (positions) => {
    const isBlockExists = svgBarChart.querySelector('#positions')
    isBlockExists && isBlockExists.remove();
    const positionsBlock = createSVGElement('g', svgBarChart, {id: 'positions'});
    const blockWidth = 185;
    for (let i = 0, j = CHART_X_STEP; i < positions.length; i++, j += blockWidth) {
        createChartPositionLegend(positionsBlock, positions[i], j)
    }
}

window.addEventListener('load', () => render())

SELECTOR.addEventListener('change', (e) => {
    render();
    header.textContent = getChartTitle(e.target.value);
})

SELECT_ALL.addEventListener('change', e => {
    lists.forEach(item => {
        item.checked = !!e.target.checked
    })
    render();
})

CITIES_BLOCK.addEventListener('change', (e) => {
    const isChecked = Array.from(lists).every(el => el.checked)
    SELECT_ALL.checked = isChecked;
})

const chartBlock = createSVGElement('g', svgBarChart, {class: 'graph__chart'})
const render = () => {
    chartBlock.querySelectorAll('g').forEach(el => el.remove());
    const cities = getSelectedCities();
    const {result, positions} = getDataForChart(SELECTOR.value, cities);
    const chartData = Object.entries(result);
    renderChartPositions(positions)

    for (let i = 0; i < chartData.length; i++) {
        const colNUmber = document.getElementById(chartData[i][0]);
        const startX = chartData[i][0] === '0' ?
            +colNUmber.getAttribute('x') + 15 :
            colNUmber.getAttribute('x') - 25;

        createChartColumn(chartData[i][1], positions, startX)
    }
}
import ChartService from "./ChartService.js";

const CONTAINER_BLOCK = document.getElementById('container');
const CITIES_BLOCK = document.getElementById('cities');
const SELECT_ALL = document.getElementById('select-all');
const SELECTOR = document.getElementById('selector');
const COLORS = ['#9469a4', '#2391cb', '#1accd2', '#175785', '#e2bb17'];
const CHART_Y_STEP = 60;
const CHART_X_STEP = 45;
const PADDING = 10;
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
        y: CHART_Y_STEP / 2
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
        x: 20,
        y: i,
        class: 'graph__text'
    }, j.toString())
}

for (let i = CHART_X_STEP + 5, j = 0; i <= svgChartCoords.width - CHART_X_STEP, j <= 10; i += 82, j++) {
    createSVGElement('text', svgBarChart, {
        x: j > 0 ? i + 31 : i,
        y: svgChartCoords.height - CHART_Y_STEP + PADDING,
        class: 'graph__text',
        id: j,
    }, !j ? 'less than a year' : j)
}

const axisX = createSVGElement('line', svgBarChart, {
    x1: CHART_X_STEP,
    x2: svgChartCoords.width - CHART_X_STEP,
    y1: svgChartCoords.height - CHART_Y_STEP - PADDING,
    y2: svgChartCoords.height - CHART_Y_STEP - PADDING,
    class: 'grid'
})
const axisY = createSVGElement('line', svgBarChart, {
    x1: CHART_X_STEP,
    x2: CHART_X_STEP,
    y1: CHART_Y_STEP,
    y2: svgChartCoords.height - CHART_Y_STEP - PADDING,
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

const renderCitiesBlock = (data) => {
    const cities = new Set();
    data.forEach(form => cities.add(form.city));

    Array.from(CITIES_BLOCK.children).forEach(el => el.remove())
    Array.from(cities)
        .sort((a, b) => a.localeCompare(b))
        .forEach(city => {
            const li = createHTMLElement('li', CITIES_BLOCK)
            const checkbox = createHTMLElement('input', li, {
                type: 'checkbox',
                className: 'cities__list',
                value: city
            });

            createHTMLElement('label', li, {textContent: city})
            checkbox.addEventListener('change', async () => {
                const arr = [];
                const list = document.querySelectorAll('.cities__list');
                list.forEach(city => city.checked && arr.push(city.value))
                await ChartService.setCities(arr)
                await render()
            });
        })

    return document.querySelectorAll('.cities__list');
}

const getSelectedCities = (initialSelected) => {
    if (initialSelected && initialSelected.length) {
        return initialSelected;
    }

    const selectedCities = [];
    const lists = document.querySelectorAll('.cities__list');
    lists.forEach(el => {
        el.checked = false;
        selectedCities.push(el.value)
    });

    return selectedCities;
}

const getDataForChart = (data, cities) => {
    const positions = new Set();

    const result = data
        .reduce((total, current) => {
            if (cities.includes(current.city)) {
                positions.add(current.position)
                const exp = current.experience < 1 ? 0 : current.experience;
                total[exp] ? total[exp].push(current) : total[exp] = [current];
            }
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
        return group[Math.floor(index)].salary
    }
    const lower = group[index - 1];
    const upper = group[index];
    return Math.round((lower.salary + upper.salary) / 2);
}

const getChartDescription = (group) => {
    const getAverageSalary = (arr) => {
        const sum = arr.reduce((total, curr) => total + curr.salary, 0);
        return (sum / arr.length).toFixed(0);
    }

    const getNQuartile = (quartile, group) => {
        if (group.length <= 1) {
            return group[0].salary
        }
        const idx = quartile * (group.length - 1) / 100;
        const intPart = Math.trunc(idx);
        const floatedPart = idx - intPart;
        const res = group[intPart].salary + floatedPart * (group[intPart + 1].salary - group[intPart].salary)
        return res.toFixed()
    }

    const sortedGroup = group.sort((a, b) => a.salary - b.salary);
    const min = sortedGroup[0].salary;
    const max = sortedGroup[sortedGroup.length - 1].salary;
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
    const colHeight = svgChartCoords.height - 2 * CHART_Y_STEP - PADDING;
    const colForms = data.length;
    let colYStart = 0;

    const group = data
        .reduce((total, current) => {
            const position = current.position;
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
        width: 56,
        height: height,
        fill: color
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
    const icon = createSVGElement('rect', group, {
        fill: positionInfo[1],
        y: svgChartCoords.height - CHART_Y_STEP + 23,
        x: xStart,
        width: 15,
        height: 15,
        rx: 4,
        ry: 4,
    });

    const iconY = icon.getAttribute('y')
    createSVGElement('text', group, {
        x: xStart + 25,
        y: +iconY + 12,
        class: 'graph__text'
    }, positionInfo[0]);
}

const renderChartPositions = (positions) => {
    const isBlockExists = svgBarChart.querySelector('#positions')
    isBlockExists && isBlockExists.remove();
    const positionsBlock = createSVGElement('g', svgBarChart, {id: 'positions'});
    const blockWidth = 175;
    for (let i = 0, j = CHART_X_STEP + 15; i < positions.length; i++, j += blockWidth) {
        createChartPositionLegend(positionsBlock, positions[i], j)
    }
}

const setInitialConfig = config => {
    SELECTOR.value = config.langOrSpec;
    const list = document.querySelectorAll('.cities__list');
    if (config.cities) {
        list.forEach(city => {
            city.checked = config.cities.includes(city.value)
        })
        SELECT_ALL.checked = Array.from(list).every(el => el.checked);
    } else {
        SELECT_ALL.checked = false;
    }
}

window.addEventListener('load', async () => {
    await render();
})

SELECTOR.addEventListener('change', async (e) => {
    await ChartService.setLangOrSpec(e.target.value);
    await render();
    header.textContent = getChartTitle(e.target.value);
})

SELECT_ALL.addEventListener('change', async e => {
    const lists = document.querySelectorAll('.cities__list');
    const cities = [];
    lists.forEach(item => {
        !!e.target.checked && cities.push(item.value)
        item.checked = !!e.target.checked
    })
    await ChartService.setCities(cities);
    await render();
})

CITIES_BLOCK.addEventListener('change', (e) => {
    const lists = document.querySelectorAll('.cities__list')
    SELECT_ALL.checked = Array.from(lists).every(el => el.checked)
})

const chartBlock = createSVGElement('g', svgBarChart, {class: 'graph__chart'});

const fetchData = async () => {
    const config = await ChartService.getChartConfig();
    const data = await ChartService.loadForms(config.langOrSpec);

    return {data, config}
}

const showSidebar = (data, config) => {
    renderCitiesBlock(data)
    setInitialConfig(config);
    config.cities = getSelectedCities(config.cities);

    return config.cities
}

const createChartColumns = (formsObj, positions) => {
    const chartData = Object.entries(formsObj);
    for (let i = 0; i < chartData.length; i++) {
        const colNUmber = document.getElementById(chartData[i][0]);
        const startX = chartData[i][0] === '0' ?
            +colNUmber.getAttribute('x') + 10 :
            colNUmber.getAttribute('x') - 25;
        createChartColumn(chartData[i][1], positions, startX)
    }
}

const render = async () => {
    chartBlock.querySelectorAll('g').forEach(el => el.remove());
    const {data, config} = await fetchData();
    const selectedCities = showSidebar(data, config);
    const {result, positions} = getDataForChart(data, selectedCities);
    renderChartPositions(positions)
    createChartColumns(result, positions);
}
async function chron_v1(path, cache = "default") {
    const r = await fetch("https://api.sibr.dev/chronicler/v1" + path, {
        cache: cache
    });
    const j = await r.json();
    return j.data;
}

async function chron_v2(params, cache = "default") {
    let query = new URLSearchParams();
    for (let p in params) {
        query.set(p, params[p]);
    }
    const r = await fetch("https://api.sibr.dev/chronicler/v2/entities?" + query.toString(), {
        cache: cache
    });
    const j = await r.json();
    return j.items;
}

function add_sec(d, s) {
    return new Date(d.getTime() + s * 1000);
}

async function main() {
    // TODO: multiple seasons
    const SEASON = 18;
    const start_times = [];
    const time_map = await chron_v1("/time/map");
    for (let day of time_map) {
        // TODO: check that minisiestas are handled correctly
        if (day.season === SEASON - 1) {
            start_times[day.day] = add_sec(new Date(Date.parse(day.startTime)), 1);
        }
    }
    // TODO: this is only for s18
    const TEAM_IDS = ["105bc3ff-1320-4e37-8ef0-8d595cb95dd0", "d9f89a8a-c563-493e-9d64-78e4f9a55d4a", "ca3f1c8c-c025-4d8e-8eef-5be6accbeb16", "c73b705c-40ad-4633-a6ed-d357ee2e2bcf", "bfd38797-8404-4b38-8b82-341da28b1f83", "bb4a9de5-c924-4923-a0cb-9d1445f1ee5d", "b72f3061-f573-40d7-832a-5ad475bd7909", "b63be8c2-576a-4d6e-8daf-814f8bcea96f", "b024e975-1c4a-4575-8936-a3754a08806a", "adc5b394-8f76-416d-9ce9-813706877b84", "a37f9158-7f82-46bc-908c-c9e2dda7c33b", "9debc64f-74b7-4ae1-a4d6-fce0144b6ea5", "979aee4a-6d80-4863-bf1c-ee1a78e06024", "8d87c468-699a-47a8-b40d-cfb73a5660ad", "878c1bf6-0d21-4659-bfee-916c8314d69c", "7966eb04-efcc-499b-8f03-d13916330531", "747b8e4a-7e50-4638-a973-ea7950a3e739", "57ec08cc-0411-4643-b304-0e80dbc15ac7", "46358869-dce9-4a01-bfba-ac24fc56f57e", "3f8bbb15-61c0-4e3f-8e4a-907a5fb1565e", "36569151-a2fb-43c1-9df7-2df512424c82", "eb67ae5e-c4bf-46ca-bbbc-425cd34182ff", "23e4cbc1-e9cd-47fa-a35b-bfa06f726cb7", "f02aeae2-5e6a-4098-9842-02d2273f25c7"];
    const INITIAL = {
        'Garages': [-0.026909257283943003, -0.03629465489673271],
        'Pies': [-0.02675687786256802, -0.07838434209674607],
        'Millennials': [-0.026825076528807685, -0.045055984094797275],
        'Flowers': [-0.026882226359353535, 0.035709737685937486],
        'Mechanics': [-0.026852297988299637, 0.11029919604294866],
        'Wild Wings': [-0.026959035838864432, 0.08193549373183846],
        'Tigers': [-0.02689988972415722, -0.07192523100836015],
        'Magic': [-0.02675156232922479, -0.16606757359221996],
        'Tacos': [-0.027033665801672765, -0.0031090086379730493],
        'Crabs': [-0.026836522900112146, -0.07397353263442558],
        'Fridays': [-0.01585056941393788, -0.15415598415620485],
        'Spies': [-0.02690406814819206, -0.08777701535603094],
        'Jazz Hands': [-0.02683249563248326, -0.11928918124334802],
        'Breath Mints': [-0.026824722473956942, -0.01953550770498054],
        'Steaks': [-0.02694170187834794, -0.12228255988228035],
        'Dale': [-0.026751032217306122, 0.06077978098422218],
        'Lovers': [-0.026867638884796236, -0.007308713529376641],
        'Worms': [-0.02692168814016255, -0.15712719747639028],
        'Shoe Thieves': [-0.02684159136203873, -0.19004192891741542],
        'Lift': [-0.026878382659903822, 0.07115937988902471],
        'Firefighters': [-0.02687474669227539, -0.11959804415497671],
        'Georgias': [-0.02692073013381523, -0.06536883977643457],
        'Moist Talkers': [-0.02693604516447873, 0.004706570895140812],
        'Sunbeams': [-0.026859221321570034, 0.02150231524093019],
    }
    const LEVELS = ["0D", "1D", "2D", "3D", "C", "Low A 🦈", "High A 🦈🦈", "AA 🦈🦈🦈", "AAA 🦈🦈🦈🦈", "AAAA 🦈🦈🦈🦈🦈", "AAAAA 🦈🦈🦈🦈🦈🦈"];
    const teams = {};
    const noodles = [];
    for (let team of TEAM_IDS) {
        teams[team] = [];
    }
    let bar = document.getElementById("bar");
    for (const [day, start] of start_times.entries()) {
        const teams_chron = await chron_v2({
            type: "team",
            id: TEAM_IDS.join(","),
            at: add_sec(start, 5 * 60).toISOString()
        }, "force-cache");
        for (let team of teams_chron) {
            teams[team.entityId].push(team.data);
        }
        const idols = await chron_v2({
            type: "idols",
            at: add_sec(start, 5 * 60).toISOString(),
            count: 1
        }, "force-cache");
        noodles.push(idols[0].data.data.strictlyConfidential);
        console.log("loading day", day);
        bar.style.width = (100 * (day + 1) / start_times.length) + "%";
    }
    document.getElementById("progress").style.display = "none";

    // TODO: noodle overrides for multiple seasons
    const NOODLE_OVERRIDES = {
        98: 8
    }
    for (let day in NOODLE_OVERRIDES) {
        console.log(`overriding noodle ${day}: ${noodles[day]} -> ${NOODLE_OVERRIDES[day]}`);
        noodles[day] = NOODLE_OVERRIDES[day];
    }
    console.log(noodles);

    const DEN_DENOM = -2768.5;
    const DEN_OFF = -1101.7398;
    const columns = [];
    const COLORS = {
        "Breath Mints": "#509e77",
        "Crabs": "#cd7672",
        "Dale": "#8877ee",
        "Firefighters": "#ff4230",
        "Flowers": "#cc66dd",
        "Fridays": "#04a321",
        "Garages": "#3f88fd",
        "Georgias": "#339991",
        "Jazz Hands": "#6b95b1",
        "Lift": "#f032c9",
        "Lovers": "#dd6699",
        "Magic": "#f94965",
        "Mechanics": "#998800",
        "Millennials": "#aa77aa",
        "Moist Talkers": "#009bc2",
        "Pies": "#339991",
        "Shoe Thieves": "#6388c8",
        "Spies": "#9980ba",
        "Steaks": "#b2838d",
        "Sunbeams": "#aa8855",
        "Tacos": "#aa66ee",
        "Tigers": "#f05d14",
        "Wild Wings": "#cc7733",
        "Worms": "#aa8877"
    };
    const datasets = [];
    let yMin = Infinity;
    let yMax = -Infinity;
    for (let team of TEAM_IDS) {
        let nickname = teams[team][0].nickname;
        let data = [];
        let [eVelocity, imPosition] = INITIAL[nickname];
        for (const [i, t] of teams[team].entries()) {
            let level = t.level;
            let noodle = noodles[i]
            let eDensity = t.eDensity;
            if (i > 0) {
                eVelocity = 0.55 * (eVelocity - imPosition + 0.0388 * noodle + (eDensity + DEN_OFF) / DEN_DENOM);
                imPosition += eVelocity;
            }
            let expected_level = Math.floor((1 - imPosition) * 5);
            if (level !== expected_level) {
                console.log("ANOMALY:", nickname, i, eDensity, imPosition, noodle, level, expected_level);
            }
            data.push(imPosition);
            yMin = Math.min(yMin, imPosition);
            yMax = Math.max(yMax, imPosition);
        }
        datasets.push({
            label: nickname,
            backgroundColor: COLORS[nickname],
            borderColor: COLORS[nickname] + "60",
            data: data,
            borderWidth: 1,
            pointRadius: 2.5
        });
    }
    const annotations = {};
    for (const [i, level] of LEVELS.entries()) {
        if (i > 0) {
            annotations["line" + i] = {
                type: 'line',
                yMin: 1 - 0.2 * i,
                yMax: 1 - 0.2 * i,
                borderColor: 'rgba(0,0,0,0.5)',
                borderWidth: 1,
                display: true
            };
        }
        annotations["level" + i] = {
            type: 'line',
            yMin: 0.9 - 0.2 * i,
            yMax: 0.9 - 0.2 * i,
            borderColor: "transparent",
            borderWidth: 0,
            display: true,
            label: {
                content: level,
                backgroundColor: 'rgba(0,0,0,0.7)',
                xPadding: 2,
                yPadding: 2,
                cornerRadius: 2,
                position: "start",
                enabled: true,
                font: {
                    size: 12,
                    style: "normal"
                }
            }
        };
    }

    function add_vert(x, label) {
        annotations[label] = {
            type: 'line',
            xMin: x,
            xMax: x,
            borderColor: 'rgba(0,0,0,0.5)',
            borderWidth: 1,
            display: true,
            label: {
                content: label,
                backgroundColor: 'rgba(0,0,0,0.7)',
                position: "end",
                enabled: true,
                xPadding: 2,
                yPadding: 2,
                cornerRadius: 2,
                font: {
                    size: 10,
                    style: "normal"
                }
            }
        };
    };
    add_vert(27.5, "Earlsiesta");
    add_vert(72.5, "Latesiesta");
    add_vert(99.5, "Endseason");

    const getOrCreateTooltip = (chart) => {
        let tooltipEl = chart.canvas.parentNode.querySelector('div');

        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
            tooltipEl.style.borderRadius = '3px';
            tooltipEl.style.color = 'white';
            tooltipEl.style.opacity = 1;
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.transform = 'translate(10%, 0%)';
            tooltipEl.style.font = "12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";

            const table = document.createElement('table');
            table.style.margin = '0px';

            tooltipEl.appendChild(table);
            chart.canvas.parentNode.appendChild(tooltipEl);
        }

        return tooltipEl;
    };

    const externalTooltipHandler = (context) => {
        // Tooltip Element
        const {
            chart,
            tooltip
        } = context;
        const tooltipEl = getOrCreateTooltip(chart);

        // Hide if no tooltip
        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
        }

        // Set Text
        const title = "Day " + tooltip.title[0];
        const bodyLines = tooltip.body.map(b => b.lines);

        const tableHead = document.createElement('thead');

        const tr = document.createElement('tr');
        tr.style.borderWidth = 0;
        const th = document.createElement('th');
        th.style.borderWidth = 0;
        th.colSpan = 3;
        const text = document.createTextNode(title);
        th.appendChild(text);
        tr.appendChild(th);
        tableHead.appendChild(tr);

        const tableBody = document.createElement('tbody');
        const dataPoints = [...tooltip.dataPoints].sort((a, b) => b.raw - a.raw);

        let curLevel = null;

        dataPoints.forEach(dataPoint => {
            const computedLevel = Math.floor((1 - dataPoint.raw) * 5);
            if (computedLevel !== curLevel) {
                curLevel = computedLevel;
                const tr = document.createElement('tr');
                tr.style.borderWidth = 0;
                const th = document.createElement('th');
                th.style.borderWidth = 0;
                th.colSpan = 3;
                const text = document.createTextNode(LEVELS[computedLevel]);
                th.appendChild(text);
                tr.appendChild(th);
                tableBody.appendChild(th);
            }

            const dataset = dataPoint.dataset;

            const span = document.createElement('span');
            span.style.background = dataset.backgroundColor;
            span.style.borderColor = dataset.borderColor;
            span.style.borderWidth = '2px';
            span.style.marginRight = '10px';
            span.style.height = '10px';
            span.style.width = '10px';
            span.style.display = 'inline-block';

            const tr = document.createElement('tr');
            tr.style.backgroundColor = 'inherit';
            tr.style.borderWidth = 0;

            const td = document.createElement('td');
            td.style.borderWidth = 0;

            const text = document.createTextNode(dataset.label);
            td.appendChild(span);
            td.appendChild(text);
            tr.appendChild(td);

            const td2 = document.createElement('td');
            td2.style.borderWidth = 0;
            td2.style.textAlign = "right";
            td2.appendChild(document.createTextNode(dataPoint.raw.toFixed(4)));
            tr.appendChild(td2);
            tableBody.appendChild(tr);
        });

        const tableRoot = tooltipEl.querySelector('table');

        // Remove old children
        while (tableRoot.firstChild) {
            tableRoot.firstChild.remove();
        }

        // Add new children
        tableRoot.appendChild(tableHead);
        tableRoot.appendChild(tableBody);

        const {
            offsetLeft: positionX,
            offsetTop: positionY,
            offsetWidth: width,
            offsetHeight: height
        } = chart.canvas;

        // Display, position, and set styles for font
        tooltipEl.style.opacity = 1;
        tooltipEl.style.top = (positionY + 20) + 'px';
        tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
        if (tooltip.caretX < width / 2) {
            tooltipEl.style.transform = "translate(10%, 0%)";
            tooltipEl.style.left = positionX + tooltip.caretX + 'px';
            tooltipEl.style.right = "";
        } else {
            tooltipEl.style.transform = "translate(-10%, 0%)";
            tooltipEl.style.right = positionX + (width - tooltip.caretX) + 'px';
            tooltipEl.style.left = "";
        }
    };

    const labels = [];
    for (let i = 0; i < start_times.length; i++) {
        labels.push((i + 1).toString());
    }
    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            onClick: (e) => {
                window.chart.resetZoom();
            },
            animation: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Day'
                    },
                    grid: {
                        drawOnChartArea: false,
                        borderColor: "black",
                        tickColor: "black"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'imPosition'
                    },
                    grid: {
                        drawOnChartArea: false,
                        borderColor: "black",
                        tickColor: "black"
                    },
                    min: Math.floor(yMin * 10) / 10,
                    max: Math.ceil(yMax * 10) / 10
                }
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy',
                        modifierKey: 'ctrl',
                    },
                    zoom: {
                        enabled: true,
                        mode: 'xy',
                        drag: {
                            borderColor: 'rgb(54, 162, 235)',
                            borderWidth: 1,
                            backgroundColor: 'rgba(54, 162, 235, 0.3)'
                        }
                    }
                },
                tooltip: {
                    enabled: false,
                    external: externalTooltipHandler
                },
                annotation: {
                    annotations: annotations
                },
                legend: {
                    position: "bottom",
                    labels: {
                        boxWidth: 12
                    }
                }
            }
        }
    };

    window.chart = new Chart(document.getElementById('chart'), config);
}

main();
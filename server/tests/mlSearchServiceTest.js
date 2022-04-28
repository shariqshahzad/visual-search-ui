const service = require('../services/mlSearchService');
var fs = require('fs');

const imagePath = '/Users/MAhmed4/Downloads/MicrosoftTeams-image-2.png',
    imageBase64 = fs.readFileSync(imagePath, 'base64');

exports.initiate = async (req, res) => {
    let totalSimilarCalls = 0;

    for (let iteration = 1; iteration <= 7; iteration++) {
        console.log(`---------------------------- YOLO ITERATION-${iteration} STARTED ----------------------------`)

        service.getYoloResults({
            img: imageBase64,
        }).then(async r => {
            for (let i in r.data) {
                const data = r.data[i];
                service.getSimilaritiesResults({
                    img: imageBase64,
                    one_per_pid: true,
                    filter_prod_type: true,
                    name: data.class,
                }).then(r => {
                    totalSimilarCalls++;
                    console.log(`--Similar call response: ${totalSimilarCalls}--`);
                });
                console.log(`--------- SIMILAR ITERATION-${(parseInt(i) + 1)} --------`)
            }
        });

        console.log(`---------------------------- YOLO ITERATION-${iteration} COMPLETED ----------------------------`)
    }

    res.send("Process Initiated. Please see the logs");
}
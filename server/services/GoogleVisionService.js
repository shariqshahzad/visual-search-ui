exports.invoke = async (params) => {

    var fs = require('fs');
    var imageFile = fs.readFileSync(params);
    var encoded = Buffer.from(imageFile).toString('base64');
    console.log('encoded',encoded);
    return;

    const vision = require('@google-cloud/vision');

    // Creates a client
    const client = new vision.ImageAnnotatorClient();

    // Performs label detection on the image file
    let requestParams = {
        "image": {
            "content": ""
        },
        "features": [
            {
                "type": "PRODUCT_SEARCH"
            }
        ],
        "imageContext": {
            "productSearchParams": {
                "productSet": "projects/project-id/locations/location-id/productSets/product-set-id",
                "productCategories": [
                    "apparel"
                ],
                "filter": "style=... AND color=..."
            }
        }
    };

    const [result] = await client.productSearch('./resources/wakeupcat.jpg');
    const labels = result.labelAnnotations;
    console.log('Labels:');
    labels.forEach(label => console.log(label.description));
};
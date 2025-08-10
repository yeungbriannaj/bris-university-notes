
// Basic structure for a Netlify serverless function.
exports.handler = async function (event, context) {
    // Get the course ID from the URL (?id=210)
    const courseId = event.queryStringParameters.id;
    console.log(`Function called for course ID: ${courseId}`);

    return {
        statusCode: 200,
        body: `Successfully received request for course ID: ${courseId}`,
    };
};

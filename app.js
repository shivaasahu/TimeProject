const express = require('express');
const https = require('https');

const app = express();
const PORT = 3000;

app.get('/getTimeStories', (req, res) => {
    const url = 'https://time.com';

    https.get(url, (response) => {
        let html = '';

        response.on('data', (chunk) => {
            html += chunk;
            
        });

        response.on('end', () => {
           
            const stories = extractStories(html);
            if (stories.length === 0) {
                console.error('No stories extracted');
                res.status(500).send('No stories extracted');
            } else {
                res.json(stories);
            }
        });
    }).on('error', (err) => {
        console.error('Error fetching data:', err.message);
        res.status(500).send('Error fetching data');
    });
});

function extractStories(html) {
    const stories = [];
    const start = html.indexOf('<div class="partial latest-stories"');
    if (start === -1) {
        console.log('Could not find "latest-stories" section');
        return stories;
    }

    // Capture a reasonable portion of HTML where stories are located
    const endSection = html.substring(start, start + 5000);

    
    // Regular expression to match each story item
    const storyRegex = /<li class="latest-stories__item">\s*<a href="(\/\d+\/[^"]+)">\s*<h3 class="latest-stories__item-headline">([^<]+)<\/h3>/g;
    let match;

    while ((match = storyRegex.exec(endSection)) !== null) {
        if (stories.length >= 6) break;

        stories.push({
            title: match[2].trim(),
            link: `https://time.com${match[1].trim()}`
        });
    }

    return stories;
}

app.listen(PORT, () => {
    console.log(`Server is running on${PORT}`);
});

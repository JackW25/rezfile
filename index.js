const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');
const cp = require('child_process');
const ffmpeg = require('ffmpeg-static');
const fluentffmpeg = require('fluent-ffmpeg');

app.use('/static', express.static('./static'));
app.listen(PORT, () => {
    console.log(`Website Online!, \n Port: ${PORT}`);
});

app.get('/', function(request, response) {
    response.sendFile('homepage.html', { root: './' });
    });

app.get('/yt-dl', function(request, response){
    response.sendFile('index.html', {root:'./'});
  });

  app.get('/faq', function(request, response) {
    response.sendFile('faq.html', { root: './' });
    });

  app.get('/about', function(request, response) {
    response.sendFile('about.html', { root: './' });
    });

  app.get('/support', function(request, response) {
    response.sendFile('unavailable.html', { root: './' });
    });

  app.get('/convert', function(request, response) {
    response.sendFile('unavailable.html', { root: './' });
    });

  app.get('/downloads', function(request, response) {
    response.sendFile('downloads-landing.html', { root: './' });
    });

   app.get('/sc-dl', function(request, response) {
    response.sendFile('soundcloud.html', { root: './' });
    });

   app.get('/ytd-encoding', function(request, response) {
    response.sendFile('encoding.html', { root: './' });
    });

        // Error Pages //
  // app.all('*', (req, res) => {
 //res.status(404).sendFile('404.html', { root: './' });
//});

        // Legacy Pages //
app.get('/legacy', function(request, response) {
    response.sendFile('old-homepage.html', { root: './' });
    console.log('Homepage Landed');
});

app.get('/legacy-ytdl', function(request, response) {
    response.sendFile('old-downloader.html', { root: './' });
    console.log('Downloader Landed');
});

app.get('/legacy-ohno', function(request, response) {
    response.sendFile('old-about.html', { root: './' });
    console.log('Downloads Page Landed');
});

    // File Downloads (updated 2023-02-19)

app.get('/mp4', (request, response) => {
    var url = request.query.url;
        ytdl.getInfo(url).then(info => {
            var title = info.videoDetails.title

        const audio = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
        const video = ytdl(url, { quality: '136' })
        const ffmpegProcess = cp.spawn(ffmpeg, [
          '-loglevel', '0', '-hide_banner',
          '-itsoffset', '3.0', '-i', 'pipe:3',
          '-i', 'pipe:4',
          '-vf', 'scale=320:240',
          '-c:v', 'libx264', '-x265-params', 'log-level=0',
          '-c:a', 'h264',
          '-f', 'matroska', 'pipe:5',
        ], {
          windowsHide: true,
          stdio: [
            /* Standard: stdin, stdout, stderr */
            'inherit', 'inherit', 'inherit',
            /* Custom: pipe:3, pipe:4, pipe:5 */
            'pipe', 'pipe', 'pipe',
          ],
        });

        audio.pipe(ffmpegProcess.stdio[3]);
        video.pipe(ffmpegProcess.stdio[4]);
        response.header("Content-Disposition", `attachment; filename="${title}.mp4`);
        ffmpegProcess.stdio[5].pipe(response);
        });
    })

app.get('/mkv', (request, response) => {
    var url = request.query.url;
        ytdl.getInfo(url).then(info => {
            var title = info.videoDetails.title
            const formatCode = '22';
        
        const video = ytdl(url, { quality: '136' })
        const audio = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
        const ffmpegmkvProcess = fluentffmpeg()
          .input(ytdl(url))
          .videoCodec('libx264')
          .audioCodec('aac')
          .format('h264')
          .videoBitrate('1024')

        response.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        response.header('Content-Type', `video/mp4`);
        ffmpegmkvProcess.pipe(response);
    });
});

app.get('/mp3', (request, response) => {
    var url = request.query.url;
        ytdl.getInfo(url).then(info => {
            var title = info.videoDetails.title
    const audio = ytdl(url, { quality: 'highestaudio' });
    response.header("Content-Disposition", `attachment; filename="${title}.mp3`);
    audio.pipe(response);
});
    });

app.get('/flac', (request, response) => {
    var url = request.query.url
        ytdl.getInfo(url).then(info => {
            var title = info.videoDetails.title
    const audio = ytdl(url, { quality: 'highestaudio' });
   const command = fluentffmpeg(audio);
    command.outputFormat('flac');
    const outputFilename = `${title}.flac`;
    response.setHeader('Content-Disposition', 'attachment; filename=' + outputFilename);
    command.pipe(response);
});
    });

app.get('/wav', (request, response) => {
    var url = request.query.url
        ytdl.getInfo(url).then(info => {
            var title = info.videoDetails.title
        const audio = ytdl(url, { quality: 'highestaudio' });
       const command = fluentffmpeg(audio);
        command.outputFormat('wav');
        const outputFilename = `${title}.wav`;
        response.setHeader('Content-Disposition', 'attachment; filename=' + outputFilename);
        command.pipe(response);
        });
    });
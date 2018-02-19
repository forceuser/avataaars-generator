#!/usr/bin/env node

/* global process, Buffer */

const http = require("http");
const express = require("express");
const im = require("imagemagick");
const generator = require("./generator");
const argv = require("yargs")
	.alias("port", "p")
	.describe("port", "define server port")
	.alias("host", "h")
	.alias("host", "ip")
	.alias("host", "l")
	.describe("host", "define host to listen to")
	.help("help")
	.argv;

const app = express();
// app.set('trust proxy', true);

const router = express.Router();

router.use("/", express.static("./"));

app.use("/", router);
app.get("/", (req, res) => {
	console.log("req.params", req.query);
	const generated = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
    "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n${generator(req.query.id, req.query.gender)}`;
	if (req.header("Accept") === "image/png" || req.query.format === "png") {
		res.header("Content-Type", "image/png");

		const params = [
			"-density", "400",
			"-resize", `${req.query.width ? Math.min(1024, +req.query.width) : ""}x${req.query.height ? Math.min(1024, +req.query.height) : (req.query.width ? "" : 128)}`,
			"-background", "none",
			"svg:-",
			"png:-",
		];
		const conv = im.convert(params, (err, stdout, stderr) => {
			res.send(new Buffer(stdout, "binary"));
		});
		conv.stdin.write(generated);
		conv.stdin.end();

		// im.resize({
		// 	srcData: generated,
		// 	width: req.query.width,
		// 	height: req.query.height ? req.query.height : (req.query.width ? undefined : 128),
		// 	format: "png",
		// }, (err, stdout, stderr) => {
		// 	console.log("im", err, stdout, stderr);
		// 	res.send(stdout);
		// });

		// svg2png(generated, {
		// 	width: req.query.width,
		// 	height: req.query.height ? req.query.height : (req.query.width ? undefined : 128),
		// })
		// 	.then(data => {
		// 		res.send(data);
		// 	});
	}
	else {
		res.header("Content-Type", "image/svg+xml");
		res.send(generated);
	}
});

const server = http.createServer(app);

server.listen(argv.port || process.env.PORT || 8080, argv.host || process.env.IP || "0.0.0.0", (req, res) => {
	const addr = server.address();

	console.log("Web server listening at", addr.address + ":" + addr.port);
});

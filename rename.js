var fs = require("fs");
var path = require("path");
var ExifImage = require("exif").ExifImage;

var getNewFileNameByDateModified = function(fileName, dateModified) {
	var fileNameID = fileName.replace("IMG_","").replace(".PNG","")
	var modYear  = dateModified.getYear() + 1900;
	var modMonth = ('0' + (dateModified.getMonth() + 1)).slice(-2);
	var modDate  = ('0' + dateModified.getDate()).slice(-2);
	var modTime  = dateModified.toString().split(" ")[4];
	var modFullDate = modYear + "-" + modMonth + "-" + modDate;
	return "IPHONE" + fileNameID + "__" + modFullDate + " (" + modTime.replace(/:/g, '.') + ").PNG";
}

var getNewFileNameByEXIFDate = function(fileName, exifDate) {
	fileName = fileName.split(".")[0].replace("IMG_","IPHONE") + "__";
	fileDate = exifDate.split(" ")[0].replace(/:/g, "-");
	fileTime = exifDate.split(" ")[1].replace(/:/g, ".");
	return fileName + fileDate + " (" + fileTime + ").JPG";
}

var isIPhoneJPG = function(fileName) {
	return (fileName.substring(0,4) === "IMG_" && fileName.substring(fileName.length - 4).toLowerCase() === ".jpg");
}

var isIPhonePNG = function(fileName) {
	return (fileName.substring(0,4) === "IMG_" && fileName.substring(fileName.length - 4).toLowerCase() === ".png");
}

var renameByEXIFDate = function(oldFileName) {
	new ExifImage({ image : oldFileName }, function(error, exifData){
		if (error) {
			console.error("ERROR: Invalid File");
		}
		if (exifData) {
			var newFileName = getNewFileNameByEXIFDate(oldFileName, exifData.exif.DateTimeOriginal);
			fs.rename(oldFileName, newFileName, function(err){
				if (err) throw err;
				console.log(oldFileName + " >>>>> " + newFileName);
			});
		}
	});
}

var renameByDateModified = function(oldFileName) {
	fs.stat(oldFileName, function(err, stat){
		var newFileName = getNewFileNameByDateModified(oldFileName, stat.mtime);
		fs.rename(oldFileName, newFileName, function(err){
			if (err) throw err;
			console.log(oldFileName + " >>>>> " + newFileName);
		});
	})
}

var sortFileName = function(fileName) {
	if (isIPhoneJPG(fileName)) {
		renameByEXIFDate(fileName);
	} else if (isIPhonePNG(fileName)) {
		renameByDateModified(fileName);
	}
}

fs.readdir(".", function(err, list) {
	list.forEach(sortFileName);
});

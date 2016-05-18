var exec = require('child_process').exec;
var fs = require('fs');

var obj = JSON.parse(fs.readFileSync('package.json', 'utf8'));

var command = "";
for (var key in obj.globalDependencies){
	command += "npm install -g ";
	command += key;
	command += "@";
	command += obj.globalDependencies[key];
	command += " && ";
}
command+="echo 'All Done!'";
exec(command, function(err, stdout, stderr){
	if (err) {
    	console.error(err);
    	return;
	}
	console.log(stdout);
});
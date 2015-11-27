var casper = require("casper").create();
var utils = require('utils');
var cfg = require('legendasTv.cfg.json');

/*casper.start('http://www.google.fr/', function() {
    this.echo(this.getTitle()); // "Google"
});*/
var links = [];
var terms = casper.cli.get("terms");
var termsArr = terms.split(' ');
var user = cfg.user;
var pass = cfg.pass;

function getLinks() {
    var links = document.querySelectorAll('#resultado_busca p:first-of-type a');
    return Array.prototype.map.call(links, function(e) {
    	var href = e.getAttribute('href');
    	var item = {
    		name: href.split('/')[4],
    		page: 'http://legendas.tv' + href,
    		download: 'http://legendas.tv/downloadarquivo/' + href.split('/')[2]
    	};
    	return item;
    });
}

function filterLinks (links, termsArr) {
	return links.filter(function(link){
		return link.page.match(new RegExp(termsArr.join('|'), 'gi')).length >= termsArr.length;
	});
}

casper.start();

casper.on('remote.message', function(msg) {
  this.echo(msg);
})

casper.open('http://legendas.tv/login', {
    method: 'post',
    data:   {
        '_method': 'POST',
        'data[User][username]':  user,
        'data[User][password]': pass
    }
});

casper.thenOpen('http://legendas.tv/busca/' + terms);

casper.then(function() {
	this.echo(this.getTitle());
	var links = this.evaluate(getLinks);

	links = this.evaluate(filterLinks, links, termsArr);
	links.forEach(function(item){
		casper.echo(item.download);
		casper.download(item.download, item.name+'.rar');
		casper.download(item.download, item.name+'.srt');
	});
	utils.dump(links);
	this.capture('legendasTV.png');
	casper.exit();
});

casper.run();

//casper.exit();
$(document).ready(function() {
	holdingPageDetails();
	$(window).resize(holdingPageDetails);

	$("#page-content #tags-nav li a").click(function(e){
		$(this).toggleClass('active');

		var txt = $(this).text();
		if($(this).hasClass("active")){
			txt = "+" + txt.substring(1);
		}else{
			txt = "-" + txt.substring(1);
		}
		$(this).text(txt);
	});

	$("#page-content #names-nav li a").click(function(e){
		$("#page-content #names-nav li a").removeClass("active");
		$(this).toggleClass("active");
	});

});

function holdingPageDetails(){
	if(window.innerWidth >= 480){
		$("header.holding-page u, header.holding-page #show-details").hover(function() {
			$("header.holding-page #show-details").css('max-height', '1500px');
		}, function() {
			$("header.holding-page #show-details").css('max-height', '0px');
		});
	}
}
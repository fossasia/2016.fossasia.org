$(document).ready(function(){
$("#filter").on("keyup", function() {
var g = $(this).val().toLowerCase();
$(".session-title").each( function() {
var s = $(this).text().toLowerCase();
if (s.indexOf(g)!=-1) {
$(this).parent().parent().parent().parent().show();

}
else {
$(this).parent().parent().parent().parent().hide();
}
});
});
});
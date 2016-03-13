$(document).ready(function(){
$("#filter").on("keyup", function() {
var g = $(this).val().toLowerCase();
console.log(g);
$(".session-title").each( function() {
var s = $(this).text().toLowerCase();
console.log(s)
if (s.indexOf(g)!=-1) {
$(this).parent().parent().parent().parent().show();

}
else {
$(this).parent().parent().parent().parent().hide();
}
});
});
});
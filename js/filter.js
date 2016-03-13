$(document).ready(function(){
$("#filter").on("keyup", function() {
var g = $(this).val();
console.log(g);
$(".session-title").each( function() {
var s = $(this).text();
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

$(document).ready(function(){
    //get current blogs 
    getBlogs();
    $("#blogarea").css("display","none");
});

function register(){
    uname=$("#username").val();
    if (uname.length>0){
        $("#loginarea").fadeOut("slow");
        $("#blogarea").fadeIn("slow");
        $("#loginfo").append("<p>Logged as: "+uname+"</p>");
    }
}

function getBlogs(){
    $.getJSON("/blog",function(data,status){
        $.each(data["result"],function(key,value){
          addBlog(value);
        });
    });
    
}

function addBlog(title){
    n=$("#activeblog").children().length;
    if (title.length>0){
    	newentry='<option id="'+(n+1)+'"value="'+title+'">'+title+'</option>';
        $("#activeblog").append(newentry);
    }
}

function newBlog(){
    title=$("#blogtitle").val();
    if (title.length>0){
        addBlog(title);
        alert("(!) Creado el blog:"+title+" by "+$("#username").val());
        //send post data to back-end
    }
}

function showBlog(){   
    $("#postsarea").children().remove();
    if ($("#activeblog").val()!="none"){
        blogname=$("#activeblog").val();
        $("#postsarea").append("<h2>Blog: "+blogname.toUpperCase()+"</h2>");
        //getInfo of the blog an show it
        //get comments of selected blog and add them to #postarea
    }
}

function addPost(){
    if ($("#postsarea").children().length==0){
       alert("(Error!) Debes seleccionar un blog");
    }
    else{
    $("#postsarea").append("<p class='post'>"+$("#newpost").val()+"</p>");
    //send post data to back-end
    }
}

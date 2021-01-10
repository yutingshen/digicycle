$(function() {
  // expose our socket client
  var socket = io();
  
  // handle and submit new chat messages to our server
  $("form").submit(function(e) {
      e.preventDefault(); // prevents page reloading
      
      socket.emit("first name", $("#first_name").val());
            socket.emit("last name", $("#last_name").val());
            socket.emit("email", $("#email_address").val());
            socket.emit("phone", $("#phone").val());
            socket.emit("postal code", $("#postal").val());
            socket.emit("deposit location", $("#location").val());
            socket.emit("serial number", $("#serial").val());      
            socket.emit("account id", $("#id").val());  

      var device_value = $("device").val()
      if(device_value == "laptop"){
        let laptopTrue = confirm("You will earn 5000 tokens. Press 'ok to continue");
        if(laptopTrue == true){
            socket.emit("token amount", 5000);
          

        }
      } else if(device_value == "mobile"){
        let mobileTrue = confirm("You will earn 2000 tokens. Press 'ok' to continue.");
        if(mobileTrue == true){
            socket.emit("token amount", 2000);
        }
      } else if(device_value == "tablet"){
        let tabletTrue = confirm("You will earn 3000 tokens. Press 'ok' to continue.");
        if(tabletTrue == true){
            socket.emit("token amount", 3000);
      }
      } else if(device_value == "smart_watch"){
        let smartTrue = confirm("You will earn 1000 tokens. Press 'ok' to continue.");
        if(smartTrue == true){
          socket.emit("token amount", 1000);
      }
      } else if(device_value == "monitor"){
          let monitorTrue = confirm("You will earn 3000 tokens. Press 'ok' to continue.");
        if(monitorTrue == true){
          socket.emit("token amount", 8000);
      }
      }
 
      return false;
  });

});
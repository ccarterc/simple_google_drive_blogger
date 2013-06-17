var db = ScriptDb.getMyDb();

//Main Function Called when script is loaded
function doGet() {
  var myapp = UiApp.createApplication().setTitle('Bloggy');

  //create layout grid
  var articleSubmitGrid = myapp.createGrid(3, 2).setId('articleSubmitGrid');//3 high 2 wide
  articleSubmitGrid.setWidget(0, 0, myapp.createLabel('Title:'));
  articleSubmitGrid.setWidget(0, 1, myapp.createTextBox().setName('titleText').setId('titleText'));
  articleSubmitGrid.setWidget(1, 0, myapp.createLabel('Article:'));
  articleSubmitGrid.setWidget(1, 1, myapp.createTextArea().setName('articleText').setId('articleText'));
  articleSubmitGrid.setWidget(2, 0, myapp.createLabel('Author'));
  articleSubmitGrid.setWidget(2, 1, myapp.createTextBox().setName('authorText').setId('authorText'));

  //make button and panel
  var articleSubmitButton = myapp.createButton('Submit').setId('articleSubmitButton');
  var articleSubmitPanel = myapp.createVerticalPanel();
  var constantMessage = myapp.createLabel("Remember you must have a folder named 'Bloggy' in your root and it must be shared to public.").setId('constantMessage');
  articleSubmitPanel.setId('articleSubmitPanel');
  articleSubmitPanel.add(articleSubmitGrid);
  articleSubmitPanel.add(articleSubmitButton);
  articleSubmitPanel.add(constantMessage);
  myapp.add(articleSubmitPanel);  

  //create the server handler
  var handler = myapp.createServerHandler('myClickHandler');
  handler.addCallbackElement(articleSubmitPanel);
  articleSubmitButton.addClickHandler(handler);  

  return myapp;
}

//click handler
function myClickHandler(e) {
  var app = UiApp.getActiveApplication();
  
  Logger.log(e);
  
  var popPanel = app.createPopupPanel();
  var message = app.createLabel("Default Text");    
  
  if (e.parameter.source == 'articleSubmitButton'){        
    var title = e.parameter.titleText;
    var article = e.parameter.articleText;
    var author = e.parameter.authorText;
    
    var goodSave = saveArticleToDb(title, article, author);//goodSave returns the docId of new file as string    
    
    if(!(goodSave == "" || goodSave == null)){//make sure there is a docId otherwise the save failed.
      var text = "You're article was submitted successfully!  Here is the link to your new file: www.googledrive.com/host/" + goodSave;
      message.setText(text);
      clearForm();
    //showResults(e);
    } else {
      message.setText("Article Submission Failed!");
    }        
    
    popPanel.add(message);
    popPanel.setAnimationEnabled(true);  
    popPanel.setPopupPosition(25, 75);
    popPanel.setAutoHideEnabled(true);
    popPanel.show();//pop up panel to show whether new file was made or not and show the URL of new file    
  } 
    
  app.close();
  return app;
}

function clearForm(){
  var app = UiApp.getActiveApplication();
  
  var title = app.getElementById('titleText');
  var article = app.getElementById('articleText');
  var author = app.getElementById('authorText');
  title.setText("");
  article.setText("");
  author.setText("");
  
  app.close();
  return app;
}

//save article to db
function saveArticleToDb(title, article, author){
  var numItems = db.count({type: "blogPost"});
  Logger.log(numItems);
  
  var current = {type: "blogPost",
                    title: title,
                    article: article,
                    author: author,
                    docId: "",
                    id: numItems+1};//this is our auto increment - not necessary for this app but good to know 
  db.save(current);
  var newDocId = updateWebfolder(current);//post the article to web and this var holds the newDocId
  return newDocId;//used to show user the URL for the new file.
}

//publish file
function updateWebfolder(current){
     
    var contents = current.article + current.author;
    var file = DocsList.createFile(current.title, contents);//create the new post file.
    var folder = DocsList.getFolder('Bloggy');    
    
    file.addToFolder(folder);    
    
    var ob = db.query({id: current.id}).next();//get the scriptDB info of the file(scriptDB holds the info of all posts.)
    ob.docId = file.getId();//set the docId of the file we just created in the db
    db.save(ob);
    return ob.docId;//use this to display in our message to give URL. 
}





//ONLY USED FOR TESTING
//display what is in the db
function getDBStuff(){  
  var results = db.query({});
    
  while (results.hasNext()) {
    var current = results.next();
    Logger.log(current);
  } 
};

//delete all db records
function deleteAll() {
  while (true) {
    var result = db.query({}); // get everything, up to limit
    if (result.getSize() == 0) {
      break;
    }
    while (result.hasNext()) {
      db.remove(result.next());
    }
  }
};



















//check if file exists
/*function checkIfFileExists(searchTerm) {
  try {var folder = DocsList.getFolder(searchTerm)
      return true;
      } 
      catch (e) {
      return false;
      }
};*/

//create new file or folder
/*function createFile(title, contents){
  var file = DocsList.createFile("My New Drive File", "this is a new drive file that I created with app script");
  var fileId = file.getId();
  Logger.log(fileId);
  
  file.addViewer('crazy.colby@gmail.com');//this is where we add public, useful for Bloggy
  var viewers = file.getViewers();
  for(var i = 0;i < viewers.length;i++){
   Logger.log(viewers[i].getEmail()); 
  }
};*/

//move a file or folder
function moveFileToFolder(fileId, targetFolderId) {
  var targetFolder = DocsList.getFolderById(targetFolderId);
  var file = DocsList.getFileById(fileId);
  file.addToFolder(targetFolder);
};



/*function showResults(e){
  var app = UiApp.getActiveApplication();
  
  var mygrid = app.createGrid(3, 1).setId('myGrid');
  mygrid.setWidget(0, 0, app.createLabel(e.parameter.nameText));//getting value of parameter passed in by handler
  mygrid.setWidget(1, 0, app.createLabel(e.parameter.ageText));
  mygrid.setWidget(2, 0, app.createLabel(e.parameter.cityText));
  
  var mybutton = app.createButton('New Button').setId('newButton');
  var mypanel = app.getElementById('myPanel');
  mypanel.add(mygrid);
  mypanel.add(mybutton);  //replacing the old lbls and txt with my new lbls and btn

  var handler = app.createServerHandler('myClickHandler');//reusing the click handler I already made.
  mybutton.addClickHandler(handler);//add click handler to new button  

  return app;
}*/

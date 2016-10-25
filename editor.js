var newButton, openButton, saveButton, newpicButton;
var editor;
var menu;
var fileEntry;
var hasWriteAccess;

var gui = require("nw.gui");
var fs = require("fs");
var clipboard = gui.Clipboard.get();

// Extend application menu for Mac OS
if (process.platform == "darwin") {
  var menu = new gui.Menu({type: "menubar"});
  menu.createMacBuiltin && menu.createMacBuiltin(window.document.title);
  gui.Window.get().menu = menu;
}

function handleDocumentChange(title) {
  var mode = "lua";
  var modeName = "LUA"
  if (title) {
    title = title.match(/[^/]+$/)[0];
    document.getElementById("title").innerHTML = title;
    document.title = title;
    if (title.match(/.json$/)) {
      mode = {name: "javascript", json: true};
      modeName = "JavaScript (JSON)";
    } else if (title.match(/.html$/)) {
      mode = "htmlmixed";
      modeName = "HTML";
    } else if (title.match(/.css$/)) {
      mode = "css";
      modeName = "CSS";
    }
    else if (title.match(/.lua$/)) {
      mode = "lua";
      modeName = "LUA"
    }
  } else {
    document.getElementById("title").innerHTML = "[no document loaded]";
  }
  editor.setOption("mode", mode);
  document.getElementById("mode").innerHTML = modeName;
}

function newFile() {
  fileEntry = null;
  hasWriteAccess = false;
  handleDocumentChange(null);
}

function setFile(theFileEntry, isWritable) {
  fileEntry = theFileEntry;
  hasWriteAccess = isWritable;
}

function readFileIntoEditor(theFileEntry) {
  fs.readFile(theFileEntry, function (err, data) {
    if (err) {
      console.log("Read failed: " + err);
    }

    handleDocumentChange(theFileEntry);
    editor.setValue(String(data));
  });
}

function writeEditorToFile(theFileEntry) {
  var str = editor.getValue();
  fs.writeFile(theFileEntry, editor.getValue(), function (err) {
    if (err) {
      console.log("Write failed: " + err);
      return;
    }

    handleDocumentChange(theFileEntry);
    console.log("Write completed.");
  });
}

var onChosenFileToOpen = function(theFileEntry) {
  setFile(theFileEntry, false);
  readFileIntoEditor(theFileEntry);
};

var onChosenFileToSave = function(theFileEntry) {
  setFile(theFileEntry, true);
  writeEditorToFile(theFileEntry);
};

function handleNewButton() {
  if (false) {
    newFile();
    editor.setValue("");
  } else {
    var x = window.screenX + 10;
    var y = window.screenY + 10;
    window.open('main.html', '_blank', 'screenX=' + x + ',screenY=' + y);
  }
}

function handleOpenButton() {
  $("#openFile").trigger("click");
}

function handleSaveButton() {
  if (fileEntry && hasWriteAccess) {
    writeEditorToFile(fileEntry);
  } else {
    $("#saveFile").trigger("click");
  }
}

function handleNewPicButton() {
    editor.replaceSelection('ff');
} 

function initContextMenu() {
  menu = new gui.Menu();
  menu.append(new gui.MenuItem({
    label: 'Copy',
    click: function() {
      clipboard.set(editor.getSelection());
    }
  }));
  menu.append(new gui.MenuItem({
    label: 'Cut',
    click: function() {
      clipboard.set(editor.getSelection());
      editor.replaceSelection('');
    }
  }));
  menu.append(new gui.MenuItem({
    label: 'Paste',
    click: function() {
      editor.replaceSelection(clipboard.get());
    }
  }));

  document.getElementById("editor").addEventListener('contextmenu',
                                                     function(ev) { 
    ev.preventDefault();
    menu.popup(ev.x, ev.y);
    return false;
  });
}


onload = function() {
  initContextMenu();

  newButton = document.getElementById("new");
  openButton = document.getElementById("open");
  saveButton = document.getElementById("save");
  newpicButton = document.getElementById("newpic");

  newButton.addEventListener("click", handleNewButton);
  openButton.addEventListener("click", handleOpenButton);
  saveButton.addEventListener("click", handleSaveButton);
  newpicButton.addEventListener("click", handleNewPicButton);

  $("#saveFile").change(function(evt) {
    onChosenFileToSave($(this).val());
  });
  $("#openFile").change(function(evt) {
    onChosenFileToOpen($(this).val());
  });

  editor = CodeMirror(
    document.getElementById("editor"),
    {
      lineNumbers: true,
      theme: "lesser-dark",
      extraKeys: {
        "Cmd-S": function(instance) { handleSaveButton() },
        "Ctrl-S": function(instance) { handleSaveButton() },
      }
    });

  newFile();
  onresize();

  gui.Window.get().show();
};

onresize = function() {
  var container = document.getElementById('editor');
  var containerWidth = container.offsetWidth;
  var containerHeight = container.offsetHeight;

  var scrollerElement = editor.getScrollerElement();
  scrollerElement.style.width = containerWidth + 'px';
  scrollerElement.style.height = containerHeight + 'px';

  editor.refresh();
}

function getCompletions(token, context) {
  var found = [], start = token.string;
  function maybeAdd(str) {
    if (str.indexOf(start) == 0) found.push(str);
  }
  function gatherCompletions(obj) {
    if (typeof obj == "string") forEach(stringProps, maybeAdd);
    else if (obj instanceof Array) forEach(arrayProps, maybeAdd);
    else if (obj instanceof Function) forEach(funcProps, maybeAdd);
    for (var name in obj) maybeAdd(name);
  }

  if (context) {
    // If this is a property, see if it belongs to some object we can
    // find in the current environment.
    var obj = context.pop(), base;
    if (obj.className == "js-variable")
      base = window[obj.string];
    else if (obj.className == "js-string")
      base = "";
    else if (obj.className == "js-atom")
      base = 1;
    while (base != null && context.length)
      base = base[context.pop().string];
    if (base != null) gatherCompletions(base);
  }
  else {
    // If not, just look in the window object and any local scope
    // (reading into JS mode internals to get at the local variables)
    for (var v = token.state.localVars; v; v = v.next) maybeAdd(v.name);
    gatherCompletions(window);
    forEach(keywords, maybeAdd);
  }
  return found;
}

const loadFile = (file, fileType, fileName) => {};

export const saveFile = (fileContents, fileType, fileName, fileExtension) => {
  const blob = new Blob([fileContents], { type: fileType });
  var a = document.createElement("a");
  a.href = window.URL.createObjectURL(blob);
  if (fileName.length > 0) {
    console.log(fileName);
    // a.download = fileInputRef.split(".")[0]
    a.download = fileName + fileExtension;
  } else {
    a.download = "tasks_topics" + fileExtension;
  }
  a.click();
};

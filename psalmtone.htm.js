if(location.search.match(/dominican/i))g_tones=d_tones;
var custom_tones={};
var gSyl,syl,_clef;
var last_syl,last_gSyl,gShortMediant;
var last_lines,last_terTones,last_medTones;
var useFormat,onlyVowels,gabcFormat,usePunctaCava,repeatIntonation,italicizeIntonation,useNovaVulgata;
var includeGloriaPatri;
function updateEditor(forceGabcUpdate,_syl,_gSyl,_gShortMediant) {
  var actuallyUpdate=(typeof(_syl)=="undefined");
  if(!gSyl) gSyl = $("#versegabc").val();
  if(!syl) syl = $("#versetext").val();
  if(!_gShortMediant)_gShortMediant = gShortMediant;
  _syl = _syl || syl;
  _gSyl = _gSyl || gSyl;
  var sameSyl = (_syl == last_syl);
  var sameGSyl = (_gSyl == last_gSyl);
  var lines = sameSyl? last_lines : _syl.split('\n');
  var gMediant,gTermination;
  if(sameGSyl) {
    gMediant = last_medTones;
    gTermination = last_terTones;
  } else {
    var gabcs = _gSyl.split('\n');
    gMediant = getGabcTones(gabcs[0]);
    gTermination = getGabcTones(gabcs[1]);
  }
  var gabc;
  var medTones, terTones;
  if(sameGSyl) {
    medTones = last_medTones;
    terTones = last_terTones;
  } else {
    medTones = gMediant;
    terTones = gTermination;
    if(actuallyUpdate){
      $("#sMedAccent")[0].innerText = String(medTones.accents);
      $("#sMedAccentS")[0].innerText = (medTones.accents == 1)? "" : "s";
      if(medTones.preparatory == 0) {
        $("#sMedPrepOuter").hide();
      } else {
        $("#sMedPrep")[0].innerText = String(medTones.preparatory);
        $("#sMedPrepS")[0].innerText = (medTones.preparatory == 1)? "" : "s";
        $("#sMedPrepOuter").show();
      }
      if(gTermination) {
      $("#sTermAccent")[0].innerText = String(terTones.accents);
        $("#sTermAccentS")[0].innerText = (terTones.accents == 1)? "" : "s";
        if(terTones.preparatory == 0) {
          $("#sTermPrepOuter").hide();
        } else {
          $("#sTermPrep")[0].innerText = String(terTones.preparatory);
          $("#sTermPrepS")[0].innerText = (terTones.preparatory == 1)? "" : "s";
          $("#sTermPrepOuter").show();
        }
      }
    }
    last_medTones = medTones;
    last_terTones = terTones;
  }
  if(!sameSyl || !sameGSyl || forceGabcUpdate) {
    last_lines = lines;
  }
  var flex;
  var firstVerse=true;
  var r = '';
  var vr = '';
  var asCode = !useFormat.match(/html/i);
  var asGabc = useFormat.match(/gabc/i);
  if(asCode) r+="<code>";
  if(!asGabc || !sameSyl || !sameGSyl || forceGabcUpdate) {
    gabc = "(" + _clef + ")"
    for(var i=0; i<lines.length; ++i) {
      var line = splitLine(lines[i]);
      if(firstVerse || asGabc) {
        var result={shortened:false};
        gabc += applyPsalmTone({
          text: line[0].trim(),
          gabc: gMediant,
          useOpenNotes: usePunctaCava,
          useBoldItalic: true,
          onlyVowel: onlyVowels,
          format: gabcFormat,
          verseNumber: useNovaVulgata?"":i+1,
          prefix: true,
          suffix: false,
          italicizeIntonation: italicizeIntonation,
          result: result,
          gabcShort: _gShortMediant,
          favor: 'intonation'
        }) + (line.length == 1? "" : ((gabcFormat||bi_formats.gabc).nbsp) + gabcStar + "(:) " +
          applyPsalmTone({
            text: line[1].trim(),
            gabc: gTermination,
            useOpenNotes: usePunctaCava,
            useBoldItalic: true,
            onlyVowel: onlyVowels,
            format: gabcFormat,
            verseNumber: useNovaVulgata?"":i+1,
            prefix: false,
            suffix: true,
            italicizeIntonation: false,
            favor: 'termination'
          })) + " (::)\n";
        if(i==0) {
          if(!repeatIntonation)gMediant=removeIntonation($.extend(true,{},gMediant));
          flex = (line[0].indexOf(sym_flex) >= 0);
        }
        if(!result.shortened)firstVerse=false;
      } else {
        if(gabc && !flex) {
          var flexI = line[0].indexOf(sym_flex);
          if(flexI >= 0) {
            var syls = getSyllables(line[0].slice(0,flexI));
            var index = syls.length - 1;
            syls[index].punctuation += ' ' + sym_flex;
            syls[index].space = "";
            var sylcount = syls[index].word.length;
            index -= sylcount - 1;
            while((syls.length - index) < 3) {
              --index;
              sylcount = syls[index].word.length;
              index -= sylcount - 1;
            }
            syls.splice(0,index);
            gabc += "<i>Flex :</i>() " + applyPsalmTone({
              text: syls,
              gabc: getFlexGabc(medTones),
              useOpenNotes: false,
              useBoldItalic: false,
              onlyVowel: onlyVowels,
              format: gabcFormat
            });
            gabc = gabc.slice(0,-1) + new Array(4).join(" " + medTones.toneTenor) + "  ::)";
            flex = true;
          }
        }
        var tempString=addBoldItalic(line[0], medTones.accents, medTones.preparatory, medTones.afterLastAccent, useFormat, onlyVowels, useNovaVulgata?"":i+1,true)
            + (line.length == 1? "" : ((((useFormat in bi_formats)&&bi_formats[useFormat])||bi_formats.gabc).nbsp) + "* " + addBoldItalic(line[1], terTones.accents, terTones.preparatory, terTones.afterLastAccent, useFormat, onlyVowels,useNovaVulgata?"":i+1,false,true));
        vr += tempString + '\n';
        r += "<p style='line-height:100%;margin: 6pt 0px;'>"
          + tempString
          + "</p>";
      }
    }
  }
  var filename;
  if(asCode) r+="</code>";
  if(gabc) {
    if(!asGabc && includeGloriaPatri) {
      try {
        gabc += "\n\n%" +
          applyPsalmTone({
            text: gloria_patri_end_vowels,
            gabc: removeIntonation($.extend(true,{},gTermination)),
            useOpenNotes: false,
            useBoldItalic: false,
            onlyVowel: onlyVowels,
            format:gabcFormat,
            favor: 'termination'
          })+" (::)";
      } catch(e) { }
    }
    if(actuallyUpdate){
      filename = versesFilename(bi_formats[useFormat],$("#selPsalm").val(),$("#selTones").val(),$("#selEnd").val(),$("#cbSolemn")[0].checked)
      var header = getHeader(localStorage.psalmHeader||'');
      header["initial-style"] = 0;
      header["name"] = filename.replace(/\.[^.]*$/,'');
      gabc=header+gabc;
      $("#editor").val(gabc);
      $("#editor").keyup();
    }
  }
  last_syl = _syl;
  last_gSyl = _gSyl;
  if(actuallyUpdate){
    var verses=$("#verses")[0];
    verses.innerHTML = r;
    vtext=verses.innerText;
    try {
      var utf8=encode_utf8(vtext);
      var url="data:text/plain;charset=utf8;base64,"+btoa(utf8);
      $("#lnkDownloadVerses")
        .attr("href",url)
        .attr("data-downloadurl","text/plain:"+filename+":"+url);
    } catch(e) {
      vtext="";
    }
    if(vtext){
      $("#lnkDownloadVerses").show();
    }else{
      $("#lnkDownloadVerses").hide();
    }
  } else {
    return [gabc,vr];
  }
}

function updateVerseGabc() {
  gSyl = $("#versegabc").val();
  updateCustomTone();
  updateEditor();
}

function updateText() {
  syl = $("#versetext").val();
  updateEditor();
}

function updateEndings() {
  //update text of delete tone button
  var name = $("#selTones").val();
  var onlyReset = (name in o_g_tones);
  $("#btnDelTone").val((onlyReset?"Reset":"Delete") + " Tone")
    .attr("disabled",onlyReset && JSON.stringify(o_g_tones[name])==JSON.stringify(g_tones[name]));

  $("#selEnd").empty();
  var tone = $("#selTones").val();
  localStorage.selTones = tone;
  var endings = getEndings(tone);
  var t = g_tones[tone];
  _clef = t.clef;
  var solemn=$("#cbSolemn")[0].checked;
  var vgabc = (solemn&&t.solemn)||t.mediant;
  vgabc += "\n";
  if(endings.length == 0) {
    vgabc += t.termination||t.mediant;
  } else {
    $("#selEnd").append('<option>' + endings.join('</option><option>') + '</option>');
    vgabc += t.terminations[$("#selEnd").val()];
  }
  gShortMediant = getGabcTones((solemn&&t.shortSolemn)||t.shortMediant||t.solemn||t.mediant);
  $("#selEnd")[0].disabled = (endings.length <= 1);
  $("#versegabc").val(vgabc);
  $("#txtClef").val(t.clef);
  gSyl = vgabc;
  updateEditor();
}

function updateEnding() {
  var tone = $("#selTones").val();
  var selEnd = $("#selEnd").val();
  var solemn = $("#cbSolemn")[0].checked;
  if(solemn)$("#cbRepeatIntonation")[0].checked=localStorage.cbRepeatIntonation=repeatIntonation=true;
  localStorage.selEnd = selEnd;
  localStorage.cbSolemn = solemn;
  var t = g_tones[tone];
  _clef = t.clef;
  var vgabc = (solemn&&t.solemn)||t.mediant;
  vgabc+="\n";
  if(t.terminations) {
    vgabc += t.terminations[selEnd];
  } else {
    vgabc += t.termination||t.mediant;
  }
  gShortMediant = getGabcTones((solemn&&t.shortSolemn)||t.shortMediant||t.solemn||t.mediant);
  $("#versegabc").val(vgabc);
  $("#txtClef").val(t.clef);
  gSyl = vgabc;
  updateEditor();
}

function getPsalms() {
  var r = Array(151);
  for(var i=1; i <= 150; ++i) {
    r[i-1] = i;
  }
  r[150] = "Magnificat";
  r[151] = "Benedictus"
  return r;
}

function updatePsalm() {
  var psalmNum = $("#selPsalm").val();
  $("#cbRepeatIntonation")[0].checked= localStorage.cbRepeatIntonation = repeatIntonation = psalmNum.match(/^\d+$/)?false:true;
  
  localStorage.selPsalm = psalmNum;
  includeGloriaPatri = $("#cbIncludeGloriaPatri")[0].checked;
  localStorage.cbIncludeGloriaPatri = includeGloriaPatri;
  useNovaVulgata = $("#cbUseNovaVulgata")[0].checked;
  localStorage.cbUseNovaVulgata = useNovaVulgata;
  getPsalm(psalmNum,includeGloriaPatri,useNovaVulgata,function(text) {
    var vt = $("#versetext");
    vt.val(text);
    updateText();
  });
}

function updateGloriaPatri() {
  includeGloriaPatri = $("#cbIncludeGloriaPatri")[0].checked;
  localStorage.cbIncludeGloriaPatri = includeGloriaPatri;
  var vt = $("#versetext");
  var text=vt.val();
  var m=text.match("\\s"+gloria_patri.replace(/[?*\$\.]/g,"\\$&")+"$");
  if(includeGloriaPatri) {
    if(!m)vt.val(text+"\n"+gloria_patri);
  } else if(m)vt.val(text.slice(0,m.index));
  updateText();
}

function updateClef() {
  var clef = $("#txtClef").val();
  if(clef.length < 2)return;
  var baseClefI = parseInt(_clef[1],10);
  var clefI = parseInt(clef[1],10);
  var diff = (clefI - baseClefI) * 2;
  var vgabc = shiftGabc(gSyl,diff);
  
  var tone = $("#selTones").val();
  var t = g_tones[tone];
  var baseClefI=parseInt(t.clef[1],10);
  diff = (clefI - baseClefI) * 2;
  gShortMediant = getGabcTones(shiftGabc(t.shortMediant||t.solemn||t.mediant,diff));
  
  $("#versegabc").val(vgabc);
  gSyl = vgabc;
  _clef = clef;
  updateEditor();
}

function updateFormat() {
  var oldGabcFormat = gabcFormat;
  var oldFormat = useFormat;
  useFormat = $("#selFormat").val();
  gabcFormat = bi_formats["gabc-" + useFormat.slice(useFormat.lastIndexOf("-")+1)];
  localStorage.selFormat = useFormat;
  $("#btnDelFormat").val(((useFormat in o_bi_formats)? "Reset" : "Delete") + " Current Format");
  var f = bi_formats[useFormat];
  $("#txtBeginPrep").val(f.italic[0]);
  $("#txtEndPrep").val(f.italic[1]);
  $("#txtBeginAccented").val(f.bold[0]);
  $("#txtEndAccented").val(f.bold[1]);
  $("#txtNbsp").val(f.nbsp);
  $("#txtVersesFilename").val(f.versesName);
  $("#txtPrefix").val(f.verse[0]||"");
  $("#txtSuffix").val(f.verse[1]||"");
  updateEditor((JSON.stringify(gabcFormat) != JSON.stringify(oldGabcFormat)) || useFormat.match(/gabc(?=$|-)/) || oldFormat.match(/gabc(?=$|-)/));
}
function storeBiFormatsAndUpdate() {
  localStorage.bi_formats = JSON.stringify(bi_formats);
  updateEditor(useFormat.match(/gabc(?=$|-)/));
}
function updateBeginAccented() {
  bi_formats[useFormat].bold[0] = $("#txtBeginAccented").val();
  storeBiFormatsAndUpdate();
}
function updateEndAccented() {
  bi_formats[useFormat].bold[1] = $("#txtEndAccented").val();
  storeBiFormatsAndUpdate();
}
function updateBeginPrep() {
  bi_formats[useFormat].italic[0] = $("#txtBeginPrep").val();
  storeBiFormatsAndUpdate();
}
function updateEndPrep() {
  bi_formats[useFormat].italic[1] = $("#txtEndPrep").val();
  storeBiFormatsAndUpdate();
}
function updateNbsp() {
  bi_formats[useFormat].nbsp = $("#txtNbsp").val();
  storeBiFormatsAndUpdate();
}
function updateVersesFilename(){
  bi_formats[useFormat].versesName = $("#txtVersesFilename").val();
  storeBiFormatsAndUpdate();
}

function updatePrefix() {
  bi_formats[useFormat].verse[0] = $("#txtPrefix").val();
  storeBiFormatsAndUpdate();
}

function updateSuffix() {
  bi_formats[useFormat].verse[1] = $("#txtSuffix").val();
  storeBiFormatsAndUpdate();
}

function updateCustomTone(name){
  name=name||$("#selTones").val();
  $("#btnDelTone").attr("disabled",false);
  var temp=gSyl.split('\n');
  custom_tones[name] = g_tones[name] || {};
  custom_tones[name].clef = $("#txtClef").val();
  custom_tones[name].mediant = temp[0]||"";
  var termination = temp[1]||"";
  var ending = $("#selEnd").val();
  if(ending && custom_tones[name].terminations){
    custom_tones[name].terminations[ending] = termination;
  }
  custom_tones[name].termination = termination;
  g_tones=$.extend({},g_tones,custom_tones);
  localStorage.customTones = JSON.stringify(custom_tones);
}
function newTone(){
  var name = prompt("Please enter a name for the new custom tone");
  while(name.length>0 && name in g_tones) {
    name = prompt("There is already a tone named '" + name + "'.  Please enter a new name.");
  }
  if(name.length > 0) {
    updateCustomTone(name);
    $("#selTones optgroup").empty().append('<option>' + getPsalmTones(custom_tones).join('</option><option>') + '</option>');
    $("#selTones").val(name);
    updateEndings();
  }
}
function deleteTone() {
  var name = $("#selTones").val();
  var onlyReset = (name in o_g_tones);
  var q = "Really " + (onlyReset?"reset":"delete") + " the tone '" + name + "'?";
  if(confirm(q)) {
      delete custom_tones[name]
    if(onlyReset) {
      g_tones[name] = $.extend(true,{},o_g_tones[name]);
    } else {
      delete g_tones[name];
      var sel = $("#selTones")[0];
      $(sel).find("option:eq("+sel.selectedIndex+")").remove();
      var ttones=getPsalmTones(custom_tones);
      ttones = ttones.length? '<option>' + ttones.join('</option><option>') + '</option>' : '';
      $("#selTones optgroup").empty().append(ttones);
    }
    localStorage.customTones = JSON.stringify(custom_tones);
    updateEndings();
  }
}

function newFormat() {
  var name = prompt("Please enter a name for the new custom format");
  while(name.length>0 && name in bi_formats) {
    name = prompt("There is already a format named '" + name + "'.  Please enter a new name.");
  }
  if(name.length > 0) {
    bi_formats[name] = {italic:["_","_"],bold:["*","*"],nbsp:" ",verse:["$c. ",""]};
    $("#selFormat").append('<option>' + name + '</option>');
    $("#selFormat").val(name);
    updateFormat();
  }
}
function deleteFormat() {
  var onlyReset = (useFormat in o_bi_formats);
  var q = "Really " + (onlyReset?"reset":"delete") + " the format '" + useFormat + "'?";
  if(confirm(q)) {
    if(onlyReset) {
      bi_formats[useFormat] = $.extend(true,{},o_bi_formats[useFormat]);
    } else {
      delete bi_formats[useFormat];
      var sel = $("#selFormat")[0];
      $(sel.childNodes[sel.selectedIndex]).remove();
    }
    localStorage.bi_formats = JSON.stringify(bi_formats);
    updateFormat();
  }
}

function updateOnlyVowels() {
  localStorage.cbOnlyVowels = onlyVowels = $("#cbOnlyVowels")[0].checked;
  updateEditor(true);
}
function updateUsePunctaCava() {
  localStorage.cbUsePunctaCava = usePunctaCava = $("#cbUsePunctaCava")[0].checked;
  updateEditor(true);
}
function updateRepeatIntonation() {
  localStorage.cbRepeatIntonation = repeatIntonation = $("#cbRepeatIntonation")[0].checked;
  updateEditor(useFormat.match(/gabc/i));
}
function updateItalicizeIntonation() {
  localStorage.cbItalicizeIntonation = italicizeIntonation = $("#cbItalicizeIntonation")[0].checked;
  updateEditor(true);
}
function printMe(){
  $(document.body).css("max-width","7in");
  //setPrintFont(true);
  forceUpdateChant();
  window.print();
  $(document.body).css("max-width","initial");
  //setPrintFont(false);
  $("#editor").keyup();
}
function errorHandler(e){
  console.error(e);
}
var cancelZipping=false;
function cancelZip(e){
  e.preventDefault();
  cancelZipping=true;
  $("#lnkCancelZip").hide();
}
function versesFilename(format,psalmNum,tone,ending,solemn){
  var tone = tone.replace(/\./g,'');
  var match = tone.match(/\d+/);
  if(match)tone=match[0];
  tone = (solemn?"solemn":"") + tone + (ending? ending.replace(/\*/,"star") : '');
  return format && format.versesName?format.versesName.format(
    {"psalm":psalmNum,
      "tone":tone
    }) : psalmNum + '-' + tone + ".txt";
}
function downloadAll(e){
  e.preventDefault();
  cancelZipping=false;
  $("#lnkDownloadAll").hide();
  $("#lnkCancelZip").show();
  var zip = new JSZip();
  var psalms = getPsalms();
  var includeGloriaPatri = $("#cbIncludeGloriaPatri")[0].checked;
  var useNovaVulgata = $("#cbUseNovaVulgata")[0].checked;
  var byteArray;
  var addPsalm=function(psalmNum,text,t,ending,gSyl,shortMediant,solemn){
    var texts = updateEditor(true,text,gSyl,shortMediant);
    var filename = versesFilename(bi_formats[useFormat],psalmNum,t,ending,solemn);
    var header = getHeader(localStorage.psalmHeader||'');
    header["initial-style"] = 0;
    header["name"] = filename.replace(/\.[^.]*$/,'');
    zip.add(header["name"] + ".gabc",header + texts[0]);
    if(texts[1].length>0)zip.add(filename,texts[1]);
  };
  var getNextPsalm = function(i){
    if(cancelZipping){
      $("#lnkCancelZip").hide();
      $("#spnProgressZip").text("");
      $("#lnkDownloadAll").show();
      return;
    }
    var psalmNum = psalms[i];    
    if(psalmNum){
      getPsalm(psalmNum,includeGloriaPatri,useNovaVulgata,function(text) {
        var alsoSolemn = parseInt(psalmNum).toString()=="NaN";
        for(var t in g_tones) {
          if(t[0]=='V')continue;
          var ctone=g_tones[t];
          var solemn=false;
          var shortMediant = getGabcTones(ctone.shortMediant||ctone.solemn||ctone.mediant);
          if(ctone.terminations){
            for(var ending in ctone.terminations){
              ctermination=ctone.terminations[ending];
              addPsalm(psalmNum,text,t,ending,ctone.mediant+"\n"+ctermination,shortMediant);
              if(alsoSolemn)addPsalm(psalmNum,text,t,ending,ctone.solemn+"\n"+ctermination,ctone.shortSolemn||shortMediant,true);
            }
          } else {
            addPsalm(psalmNum,text,t,"",ctone.mediant+"\n"+ctone.termination,shortMediant);
            if(alsoSolemn)addPsalm(psalmNum,text,t,"",ctone.solemn+"\n"+ctermination,ctone.shortSolemn||shortMediant,true);
          }
        }
        ++i;
        $("#spnProgressZip").text("Generated " + i + " of " + psalms.length);
        getNextPsalm(i);
      });
    } else {
      $("#spnProgressZip").text("Zipping...");
      var data = zip.generate(true);
      byteArray = new Uint8Array(data.length);
      for (i = 0; i < data.length; i++) {
          byteArray[i] = data.charCodeAt(i) & 0xff;
      }
      window.webkitRequestFileSystem(window.TEMPORARY, 25*1024*1024 /*50MB*/, onInitFs, errorHandler);
    }
  };
  getNextPsalm(0);
  
  //location.href="data:application/zip;base64,"+zip.generate();
  var onInitFs = function(fs){
    fs.root.getFile('psalms.zip', {create: true}, function(fileEntry) {
      
      // Create a FileWriter object for our zip
      fileEntry.createWriter(function(fileWriter) {

        fileWriter.onwriteend = function(e) {
          console.log('Write completed.');
          if(fileWriter.length > fileWriter.position){
            fileWriter.truncate(fileWriter.position);
          } else {
            location.href=fileEntry.toURL();
            $("#spnProgressZip").text("");
            $("#lnkDownloadAll").show();
            $("#lnkCancelZip").hide();
          }
        };

        fileWriter.onerror = function(e) {
          console.log('Write failed: ' + e.toString());
        };

        // Create a new Blob and write it to log.txt.
        var bb = new WebKitBlobBuilder(); // Note: window.WebKitBlobBuilder in Chrome 12.
        
        bb.append(byteArray.buffer);
        fileWriter.write(bb.getBlob('application/zip'));
      }, errorHandler);
    }, errorHandler);
  }
}
function editorKeyDown(e) {
  if(e.which==9) {
    var index, indexEnd, $this = $(this), txt = $this.val();
    e.preventDefault();
    if(e.shiftKey) {
      // go backwards
      index = this.selectionStart;
      index = txt.lastIndexOf(')',index - 1);
      if(index < 0) index = txt.lastIndexOf(')');
      if(index >= 0) {
        indexEnd = index;
        index = txt.lastIndexOf('(',index);
      }
    } else {
      index = this.selectionEnd;
      index = txt.indexOf('(',index);
      if(index < 0) index = txt.indexOf('(');
      if(index >= 0) {
        indexEnd = txt.indexOf(')',index);
      }
    }
    if(index >= 0 && indexEnd >= 0) {
      this.selectionStart = index + 1;
      this.selectionEnd = indexEnd;
    }
  }
}
function updateLocalHeader() {
  var gabc = $("#editor").val();
  var header=getHeader(gabc);
  localStorage.psalmHeader=header;
}
function windowResized(){
  var $cp = $("#chant-parent2");
  var totalHeight = $(window).height() - $cp.position().top - 10;
  totalHeight = Math.max(120,totalHeight);
  $cp.height(totalHeight);
}
function updateVerseGabcStar(newStar){
  if(typeof(newStar)!='string') {
    newStar = $(this).val();
  }
  if(typeof(newStar)!='string' || newStar.length == 0) newStar = '*';
  localStorage.gabcStar = gabcStar = newStar;
  updateEditor(true);
}
$(function() {
  //if(!localStorage)localStorage=false;
  if(localStorage.bi_formats) {
    bi_formats = JSON.parse(localStorage.bi_formats);
    for(i in o_bi_formats) {
      if(i in bi_formats) {
        for(j in o_bi_formats[i]) {
          if(!(j in bi_formats[i])) {
            if(typeof(o_bi_formats[i][j])=="object") bi_formats[i][j] = $.extend(true,{},o_bi_formats[i][j]);
              else bi_formats[i][j] = o_bi_formats[i][j];
          }
        }
      } else {
        bi_formats[i] = o_bi_formats[i];
      }
    }
  }
  $("#txtGabcStar").val(gabcStar).keyup(updateVerseGabcStar);
  $("label[title][for]").each(function() {
    var forId = this.getAttribute('for');
    $("#" + forId).attr('title',this.title);
  });
  $("#chant-parent2").resizable({handles:"e"});
  $(window).resize(windowResized);
  $("#selTones").append('<option>' + getPsalmTones().join('</option><option>') + '</option><optgroup label="Custom"></optgroup>');
  $("#selPsalm").append('<option>' + getPsalms().join('</option><option>') + '</option>');
  $("#selFormat").append('<option>' + getKeys(bi_formats).join('</option><option>') + '</option>');
  $("#versegabc").keyup(updateVerseGabc);
  $("#versetext").keyup(updateText).keydown(internationalTextBoxKeyDown);
  $("#selTones").change(updateEndings);
  $("#selTones").keyup(updateEndings);
  $("#cbSolemn").change(updateEnding);
  $("#cbOnlyVowels").change(updateOnlyVowels);
  $("#cbRepeatIntonation").change(updateRepeatIntonation);
  $("#cbItalicizeIntonation").change(updateItalicizeIntonation);
  $("#cbUsePunctaCava").change(updateUsePunctaCava);
  $("#selFormat").change(updateFormat);
  $("#selFormat").keyup(updateFormat);
  $("#selEnd").change(updateEnding);
  $("#selEnd").keyup(updateEnding);
  $("#selPsalm,#cbUseNovaVulgata").change(updatePsalm);
  $("#txtPrefix").keyup(updatePrefix);
  $("#txtSuffix").keyup(updateSuffix);
  $("#txtNbsp").keyup(updateNbsp);
  $("#txtVersesFilename").keyup(updateVersesFilename);
  $("#txtClef").keyup(updateClef);
  $("#btnNewFormat").click(newFormat);
  $("#btnNewTone").click(newTone);
  $("#btnDelTone").click(deleteTone);
  $("#btnDelFormat").click(deleteFormat);
  //$("#btnPrint").click(printMe);
  $("#selPsalm").keyup(updatePsalm);
  $("#cbSolemn")[0].checked = (localStorage.cbSolemn == "true");
  $("#cbOnlyVowels")[0].checked = onlyVowels = (localStorage.cbOnlyVowels == "true");
  $("#cbUsePunctaCava")[0].checked = usePunctaCava = (localStorage.cbUsePunctaCava != "false");
  $("#cbRepeatIntonation")[0].checked = repeatIntonation = (localStorage.cbRepeatIntonation == "true");
//  $("#cbItalicizeIntonation")[0].checked = italicizeIntonation = (localStorage.cbItalicizeIntonation == "true");
  $("#selFormat").val((useFormat = (localStorage.cbTeX? "tex" : (localStorage.selFormat || "html"))));
  $("#selPsalm").val(localStorage.selPsalm || "Magnificat");
  $("#selTones").val(localStorage.selTones || "1");
  $("#txtBeginPrep").keyup(updateBeginPrep);
  $("#txtEndPrep").keyup(updateEndPrep);
  $("#txtBeginAccented").keyup(updateBeginAccented);
  $("#txtEndAccented").keyup(updateEndAccented);
  $("#cbIncludeGloriaPatri").change(updateGloriaPatri);
  $("#cbIncludeGloriaPatri")[0].checked = (localStorage.cbIncludeGloriaPatri != "false");
  $("#cbUseNovaVulgata")[0].checked = useNovaVulgata = (localStorage.cbUseNovaVulgata == "true");
  $("#editor").keyup(updateLocalHeader).keydown(editorKeyDown);
  $("#lnkDownloadVerses").bind("dragstart",onDragStart);
  $("#lnkDownloadAll").click(downloadAll);
  $("#lnkCancelZip").click(cancelZip);
  var getGabc = function(){
    var gabc = $('#editor').val(),
        header = getHeader(gabc);
    if(!header.name) header.name = '';
    if(!header['%font']) header['%font'] = 'LinLibertineO';
    if(!header['%width']) header['%width'] = '124';
    return gabc = header + gabc.slice(header.original.length);
  }
  $('#lnkPdf').click(function(e){
    var result=getGabc();    
    if(e && typeof(e.preventDefault)=="function"){
      e.preventDefault();
    }
    $('#pdfForm').attr('action','http://localhost/gregoriophp/#' + encodeURI(result)).submit();
  });
  $('#lnkPdfDirect').click(function(e){
    var gabcs=[getGabc()];
    if(e && typeof(e.preventDefault)=="function"){
      e.preventDefault();
    }
    $('#pdfFormDirect [name="gabc[]"]').remove();
    for(var i=0;i<gabcs.length;++i){
      $('#pdfFormDirect').append($('<input type="hidden" name="gabc[]"/>').val(gabcs[i]));
    }
    $("#pdfFormDirect").submit();
  });
  setGabcLinkSelector("#lnkDownloadGabc");
  updateEndings();
  windowResized();
  if($("#selEnd")[0].firstChild) $("#selEnd").val(localStorage.selEnd || $("#selEnd")[0].firstChild.innerText);
  updateEnding();
  updatePsalm();
  updateFormat();
  localStorage.removeItem("cbTeX");
  if(localStorage.customTones){
    custom_tones=JSON.parse(localStorage.customTones);
    var ttones = getPsalmTones(custom_tones);
    if(ttones.length>0){
      g_tones=$.extend({},g_tones,custom_tones);
      $("#selTones optgroup").append('<option>' + getPsalmTones(custom_tones).join('</option><option>') + '</option>');
    }
  }
});

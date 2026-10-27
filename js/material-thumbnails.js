(function(){
  let libraryPromise;
  function library(){
    if(!libraryPromise) libraryPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
      script.onload=()=>{if(!window.pdfjsLib){reject(new Error('PDF viewer tidak tersedia'));return;}window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';resolve(window.pdfjsLib);};
      script.onerror=()=>reject(new Error('PDF viewer gagal dimuat'));
      document.head.append(script);
    });
    return libraryPromise;
  }
  window.jeniusCreatePdfThumbnail=async function(path,client){
    const result=await client.storage.from('jenius-materi').createSignedUrl(path,120);
    if(result.error||!result.data?.signedUrl)throw new Error('PDF tidak dapat dibuka');
    const lib=await library();
    const task=lib.getDocument({url:result.data.signedUrl,isEvalSupported:false,disableAutoFetch:true,disableStream:true});
    let doc;
    try{
      doc=await task.promise;
      const page=await doc.getPage(1);
      const size=page.getViewport({scale:1});
      const viewport=page.getViewport({scale:Math.min(1,320/size.width)});
      const canvas=document.createElement('canvas');
      canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
      await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
      page.cleanup();
      return canvas.toDataURL('image/jpeg',0.7);
    }finally{if(doc)await doc.destroy();else await task.destroy();}
  };
})();

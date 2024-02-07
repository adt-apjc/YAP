type PKFileUploaderProps<T> = {
   disabled?: boolean;
   filename?: string;
   sshkey?: string;
   setInfo: React.Dispatch<React.SetStateAction<T>>;
};

const PKFileUploader = <T,>(props: PKFileUploaderProps<T>) => {
   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      let file = e.target.files![0];
      if (!file) return;

      let keyString = await file.text();
      props.setInfo((prev) => ({ ...prev, sshkey: keyString, keyFilename: file.name }));
   };

   const handleDeleteKey = (e: React.MouseEvent) => {
      e.stopPropagation();
      props.setInfo((prev) => ({ ...prev, sshkey: "", keyFilename: "" }));
   };

   if (props.filename)
      return (
         <>
            <div className="d-flex align-items-center">
               <div className="border rounded px-2 py-1 bg-white">
                  <span className="me-2">{props.filename}</span>
                  <i className="far fa-key" />
               </div>
               <span className="ms-2 icon-hover-highlight pointer" onClick={handleDeleteKey}>
                  <i className="far fa-trash-alt" />
               </span>
            </div>
         </>
      );
   return (
      <>
         <small className="me-2">PrivateKey Auth (optional)</small>
         <input disabled={props.disabled} className="form-control form-control-sm" type="file" onChange={handleFileChange} />
      </>
   );
};

export default PKFileUploader;

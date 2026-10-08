document.addEventListener("DOMContentLoaded", () => {

  const plusBtn = document.getElementById("adminPlusBtn");
  const uploadModal = document.getElementById("uploadModal");
  const closeUpload = document.getElementById("closeUpload");

  const publishBtn = document.getElementById("publishNewsBtn");
  const msg = document.getElementById("publishMsg");

  const titleInput = document.getElementById("newsTitle");
  const categoryInput = document.getElementById("newsCategory");
  const contentInput = document.getElementById("newsContent");
  const imageInput = document.getElementById("newsImage");

  // Supabase
  const config = window.DDS_CONFIG;

  if (!config || !window.supabase) {
    console.error("Supabase configuration not found.");
    return;
  }

  const supabaseClient = window.supabase.createClient(
    config.SUPABASE_URL,
    config.SUPABASE_KEY
  );

  // OPEN UPLOAD FORM
  plusBtn?.addEventListener("click", () => {
    uploadModal.hidden = false;
    titleInput?.focus();
  });

  // CLOSE UPLOAD FORM
  closeUpload?.addEventListener("click", () => {
    uploadModal.hidden = true;
  });

  // CLOSE WHEN CLICKING OUTSIDE
  uploadModal?.addEventListener("click", (event) => {
    if (event.target === uploadModal) {
      uploadModal.hidden = true;
    }
  });

  // PUBLISH NEWS
  publishBtn?.addEventListener("click", async () => {

    const title = titleInput.value.trim();
    const category = categoryInput.value.trim() || "Updates";
    const content = contentInput.value.trim();
    const imageFile = imageInput.files[0];

    if (!title) {
      msg.textContent = "Please enter News Title.";
      return;
    }

    if (!content) {
      msg.textContent = "Please enter News Content.";
      return;
    }

    if (!imageFile) {
      msg.textContent = "Please select a photo.";
      return;
    }

    publishBtn.disabled = true;
    publishBtn.textContent = "PUBLISHING...";
    msg.textContent = "Uploading photo...";

    try {

      // CREATE UNIQUE FILE NAME
      const extension = imageFile.name.split(".").pop();
      const fileName =
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2, 9) +
        "." +
        extension;

      const filePath = "news/" + fileName;

      // UPLOAD PHOTO
      const { error: uploadError } =
        await supabaseClient.storage
          .from("Dds-media")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false
          });

      if (uploadError) {
        throw new Error(
          "Photo upload failed: " + uploadError.message
        );
      }

      msg.textContent = "Saving news...";

      // GET PUBLIC IMAGE URL
      const { data: publicUrlData } =
        supabaseClient.storage
          .from("Dds-media")
          .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      // INSERT NEWS INTO POSTS TABLE
      const { error: postError } =
        await supabaseClient
          .from("posts")
          .insert({
            title: title,
            category: category,
            content: content,
            image_url: imageUrl,
            published: true
          });

      if (postError) {
        throw new Error(
          "News save failed: " + postError.message
        );
      }

      // SUCCESS
      msg.textContent = "✅ News Published Successfully!";

      titleInput.value = "";
      categoryInput.value = "Updates";
      contentInput.value = "";
      imageInput.value = "";

      setTimeout(() => {
        uploadModal.hidden = true;
        msg.textContent = "";
        publishBtn.disabled = false;
        publishBtn.textContent = "PUBLISH";
      }, 1500);

    } catch (error) {

      console.error(error);

      msg.textContent = "❌ " + error.message;

      publishBtn.disabled = false;
      publishBtn.textContent = "PUBLISH";
    }

  });

});

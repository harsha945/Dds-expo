const config = window.DDS_CONFIG;

const supabaseClient = supabase.createClient(
  config.SUPABASE_URL,
  config.SUPABASE_KEY
);

const adminPlusBtn = document.getElementById("adminPlusBtn");
const adminModal = document.getElementById("adminModal");
const closeAdmin = document.getElementById("closeAdmin");

const adminLogin = document.getElementById("adminLogin");
const newsUpload = document.getElementById("newsUpload");

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLoginMsg = document.getElementById("adminLoginMsg");

const newsTitle = document.getElementById("newsTitle");
const newsCategory = document.getElementById("newsCategory");
const newsContent = document.getElementById("newsContent");
const newsImage = document.getElementById("newsImage");

const publishNewsBtn = document.getElementById("publishNewsBtn");
const publishMsg = document.getElementById("publishMsg");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");


// OPEN ADMIN
adminPlusBtn.addEventListener("click", () => {
  adminModal.hidden = false;
});


// CLOSE ADMIN
closeAdmin.addEventListener("click", () => {
  adminModal.hidden = true;
});


// LOGIN
adminLoginBtn.addEventListener("click", async () => {

  adminLoginMsg.textContent = "Logging in...";

  const email = adminEmail.value.trim();
  const password = adminPassword.value;

  if (!email || !password) {
    adminLoginMsg.textContent =
      "Please enter email and password.";
    return;
  }

  try {

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      adminLoginMsg.textContent = error.message;
      return;
    }

    if (data.session) {

      adminLogin.hidden = true;
      newsUpload.hidden = false;
      adminLoginMsg.textContent = "";

    }

  } catch (error) {

    adminLoginMsg.textContent =
      "Connection error: " + error.message;

  }

});


// PUBLISH NEWS
publishNewsBtn.addEventListener("click", async () => {

  publishMsg.textContent = "Publishing...";
  publishNewsBtn.disabled = true;

  try {

    const {
      data: userData,
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
      publishMsg.textContent =
        "Please login again.";
      return;
    }

    let imageUrl = null;

    const file = newsImage.files[0];

    if (file) {

      const fileName =
        Date.now() + "-" +
        file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

      const upload =
        await supabaseClient.storage
          .from("Dds-media")
          .upload("news/" + fileName, file);

      if (upload.error) {
        publishMsg.textContent =
          upload.error.message;
        return;
      }

      const publicUrl =
        supabaseClient.storage
          .from("Dds-media")
          .getPublicUrl("news/" + fileName);

      imageUrl = publicUrl.data.publicUrl;
    }


    const { error } =
      await supabaseClient
        .from("posts")
        .insert({
          title: newsTitle.value.trim(),
          category: newsCategory.value.trim() || "Updates",
          content: newsContent.value.trim(),
          image_url: imageUrl,
          published: true,
          author_id: userData.user.id
        });


    if (error) {
      publishMsg.textContent = error.message;
      return;
    }


    publishMsg.textContent =
      "News published successfully!";

    newsTitle.value = "";
    newsCategory.value = "Updates";
    newsContent.value = "";
    newsImage.value = "";


    // Refresh news
    if (typeof loadNews === "function") {
      loadNews();
    }

  } catch (error) {

    publishMsg.textContent =
      "Error: " + error.message;

  } finally {

    publishNewsBtn.disabled = false;

  }

});


// LOGOUT
adminLogoutBtn.addEventListener("click", async () => {

  await supabaseClient.auth.signOut();

  newsUpload.hidden = true;
  adminLogin.hidden = false;

  adminEmail.value = "";
  adminPassword.value = "";

});


// LOAD NEWS
async function loadNews() {

  const { data, error } =
    await supabaseClient
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error(error);
    return;
  }

  console.log("Published news:", data);

  // మీ existing news rendering code ఇక్కడ కొనసాగుతుంది.
}


// START
loadNews();

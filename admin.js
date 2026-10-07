const c = window.DDS_CONFIG;

const loginBox = document.getElementById("loginBox");
const panel = document.getElementById("panel");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loginMsg = document.getElementById("loginMsg");

const logoutBtn = document.getElementById("logoutBtn");

const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const contentInput = document.getElementById("content");
const imageInput = document.getElementById("image");
const publishBtn = document.getElementById("publishBtn");
const msg = document.getElementById("msg");

let sb = null;

try {
  if (
    c &&
    c.SUPABASE_URL &&
    c.SUPABASE_KEY &&
    !c.SUPABASE_URL.startsWith("YOUR_") &&
    !c.SUPABASE_KEY.startsWith("YOUR_")
  ) {
    sb = supabase.createClient(
      c.SUPABASE_URL,
      c.SUPABASE_KEY
    );
  }
} catch (err) {
  console.error(err);
  loginMsg.textContent = "Supabase connection error.";
}


// LOGIN
loginBtn.addEventListener("click", async () => {
  loginMsg.textContent = "";

  if (!sb) {
    loginMsg.textContent = "Supabase connection failed.";
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    loginMsg.textContent = "Please enter email and password.";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "LOGIN...";

  try {
    const { data, error } = await sb.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      loginMsg.textContent = error.message;
      return;
    }

    if (data && data.session) {
      loginBox.hidden = true;
      panel.hidden = false;
      loginMsg.textContent = "";
    } else {
      loginMsg.textContent = "Login failed. Please try again.";
    }

  } catch (err) {
    console.error(err);
    loginMsg.textContent = "Connection error: " + err.message;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "LOGIN";
  }
});


// LOGOUT
logoutBtn.addEventListener("click", async () => {
  if (sb) {
    await sb.auth.signOut();
  }

  location.reload();
});


// PUBLISH NEWS
publishBtn.addEventListener("click", async () => {
  if (!sb) {
    msg.textContent = "Supabase connection failed.";
    return;
  }

  msg.textContent = "Publishing...";
  publishBtn.disabled = true;

  try {
    const file = imageInput.files[0];
    let image_url = null;

    if (file) {
      const path =
        `news/${Date.now()}-${file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        )}`;

      const upload = await sb.storage
        .from("Dds-media")
        .upload(path, file);

      if (upload.error) {
        msg.textContent = upload.error.message;
        return;
      }

      image_url = sb.storage
        .from("Dds-media")
        .getPublicUrl(path)
        .data.publicUrl;
    }

    const { data: userData, error: userError } =
      await sb.auth.getUser();

    if (userError || !userData.user) {
      msg.textContent = "Admin session expired. Please login again.";
      return;
    }

    const { error } = await sb
      .from("posts")
      .insert({
        title: titleInput.value.trim(),
        category: categoryInput.value.trim() || "Updates",
        content: contentInput.value.trim(),
        image_url: image_url,
        published: true,
        author_id: userData.user.id
      });

    if (error) {
      msg.textContent = error.message;
      return;
    }

    msg.textContent = "Published successfully.";

    titleInput.value = "";
    categoryInput.value = "Updates";
    contentInput.value = "";
    imageInput.value = "";

  } catch (err) {
    console.error(err);
    msg.textContent = "Error: " + err.message;
  } finally {
    publishBtn.disabled = false;
  }
});


// CHECK EXISTING LOGIN SESSION
(async () => {
  if (!sb) return;

  try {
    const { data, error } = await sb.auth.getSession();

    if (error) {
      console.error(error);
      return;
    }

    if (data.session) {
      loginBox.hidden = true;
      panel.hidden = false;
    }
  } catch (err) {
    console.error(err);
  }
})();

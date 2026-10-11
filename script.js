
/* ==========================================
   LIXXY STORE | SCRIPT UTAMA
   Cloudflare Worker + D1
   Mode demo, belum ada pembayaran sungguhan
========================================== */

"use strict";

// 1. KONFIGURASI API
const API_BASE = "https://lixxystore.lixxyskiee.workers.dev";

// 2. KATALOG PRODUK
const products = {
  "Mobile Legends": {
    code: "mobile-legends",
    fields: [
      {
        name: "userId",
        label: "User ID",
        placeholder: "Masukkan User ID",
        required: true,
        inputMode: "numeric"
      },
      {
        name: "zoneId",
        label: "Zone ID",
        placeholder: "Masukkan Zone ID",
        required: true,
        inputMode: "numeric"
      }
    ],
    denominations: [
      ["86 Diamonds", 20000],
      ["172 Diamonds", 39000],
      ["257 Diamonds", 58000],
      ["344 Diamonds", 77000],
      ["706 Diamonds", 155000]
    ]
  },

  "Free Fire": {
    code: "free-fire",
    fields: [
      {
        name: "playerId",
        label: "Player ID",
        placeholder: "Masukkan Player ID",
        required: true,
        inputMode: "numeric"
      }
    ],
    denominations: [
      ["70 Diamonds", 10000],
      ["140 Diamonds", 20000],
      ["355 Diamonds", 50000],
      ["720 Diamonds", 99000],
      ["1450 Diamonds", 198000]
    ]
  },

  "DANA": {
    code: "dana",
    fields: [
      {
        name: "phoneNumber",
        label: "Nomor HP akun DANA",
        placeholder: "Masukkan nomor HP DANA",
        required: true,
        inputMode: "tel"
      }
    ],
    denominations: [
      ["Saldo Rp10.000", 10000],
      ["Saldo Rp20.000", 20000],
      ["Saldo Rp50.000", 50000],
      ["Saldo Rp100.000", 100000]
    ]
  },

  "ShopeePay": {
    code: "shopeepay",
    fields: [
      {
        name: "phoneNumber",
        label: "Nomor HP akun ShopeePay",
        placeholder: "Masukkan nomor HP ShopeePay",
        required: true,
        inputMode: "tel"
      }
    ],
    denominations: [
      ["Saldo Rp10.000", 10000],
      ["Saldo Rp20.000", 20000],
      ["Saldo Rp50.000", 50000],
      ["Saldo Rp100.000", 100000]
    ]
  },

  "Token PLN": {
    code: "token-pln",
    fields: [
      {
        name: "customerId",
        label: "Nomor Meter / ID Pelanggan",
        placeholder: "Masukkan nomor meter atau ID pelanggan",
        required: true,
        inputMode: "numeric"
      },
      {
        name: "customerName",
        label: "Nama pelanggan (opsional)",
        placeholder: "Masukkan nama pelanggan",
        required: false,
        inputMode: "text"
      }
    ],
    denominations: [
      ["Token Rp20.000", 20000],
      ["Token Rp50.000", 50000],
      ["Token Rp100.000", 100000],
      ["Token Rp200.000", 200000]
    ]
  }
};

// 3. ELEMEN HTML
const searchInput = document.getElementById("searchInput");
const productCards = [
  ...document.querySelectorAll(".product-card")
];
const filterButtons = [
  ...document.querySelectorAll(".filter-button")
];
const emptyMessage = document.getElementById("emptyMessage");

const orderForm = document.getElementById("orderForm");
const selectedProduct = document.getElementById("selectedProduct");
const dynamicFields = document.getElementById("dynamicFields");
const denomination = document.getElementById("denomination");
const orderResult = document.getElementById("orderResult");
const customerNote = document.getElementById("customerNote");
const orderSection = document.getElementById("pesanan");

let activeCategory = "all";
let submittingOrder = false;

// 4. UTILITAS
function rupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

function showMessage(message) {
  if (!orderResult) return;

  orderResult.replaceChildren();
  orderResult.textContent = message;
  orderResult.hidden = false;
}

function hideMessage() {
  if (!orderResult) return;

  orderResult.replaceChildren();
  orderResult.hidden = true;
}

function addTextElement(parent, tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

// 5. TAMPILKAN PESANAN DARI SERVER
function renderOrder(order) {
  if (!orderResult) return;

  orderResult.replaceChildren();
  orderResult.hidden = false;

  addTextElement(
    orderResult,
    "h3",
    "Pesanan berhasil disimpan!"
  );

  addTextElement(
    orderResult,
    "p",
    `ID Pesanan: ${order.id}`
  );

  addTextElement(
    orderResult,
    "p",
    `Produk: ${order.product}`
  );

  addTextElement(
    orderResult,
    "p",
    `Nominal: ${order.denomination}`
  );

  addTextElement(
    orderResult,
    "p",
    `Harga contoh: ${rupiah(order.examplePrice)}`
  );

  addTextElement(
    orderResult,
    "p",
    `Status: ${order.status}`
  );

  addTextElement(
    orderResult,
    "p",
    "Mode demo: belum dibayar dan belum diproses ke penyedia produk."
  );

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.textContent = "Salin ID Pesanan";

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      copyButton.textContent = "ID berhasil disalin";
    } catch {
      addTextElement(
        orderResult,
        "p",
        `Salin ID ini secara manual: ${order.id}`
      );
    }
  });

  orderResult.appendChild(copyButton);

  const statusButton = document.createElement("button");
  statusButton.type = "button";
  statusButton.textContent = "Periksa Status";
  statusButton.style.marginLeft = "8px";

  statusButton.addEventListener("click", async () => {
    statusButton.disabled = true;
    statusButton.textContent = "Memeriksa...";

    try {
      const response = await fetch(
        `${API_BASE}/api/orders/${encodeURIComponent(order.id)}`
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || "Status pesanan gagal diperiksa."
        );
      }

      const statusText = orderResult.querySelector(
        "[data-order-status]"
      );

      if (statusText) {
        statusText.textContent =
          `Status terbaru: ${data.order.status}`;
      } else {
        const status = addTextElement(
          orderResult,
          "p",
          `Status terbaru: ${data.order.status}`
        );
        status.dataset.orderStatus = "true";
      }

      statusButton.textContent = "Periksa Lagi";
    } catch (error) {
      addTextElement(
        orderResult,
        "p",
        error.message || "Tidak dapat memeriksa status."
      );

      statusButton.textContent = "Coba Lagi";
    } finally {
      statusButton.disabled = false;
    }
  });

  orderResult.appendChild(statusButton);
}

// 6. PENCARIAN DAN FILTER
function filterProducts() {
  const query = (searchInput?.value || "")
    .trim()
    .toLowerCase();

  let visibleCount = 0;

  productCards.forEach((card) => {
    const productName =
      card.querySelector("h3")?.textContent || "";

    const searchableText = [
      productName,
      card.dataset.search || "",
      card.textContent || ""
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(query);

    const matchesCategory =
      activeCategory === "all" ||
      card.dataset.category === activeCategory;

    const visible = matchesSearch && matchesCategory;

    card.hidden = !visible;

    if (visible) visibleCount++;
  });

  if (emptyMessage) {
    emptyMessage.hidden = visibleCount !== 0;
  }
}

searchInput?.addEventListener("input", filterProducts);

filterButtons.forEach((button) => {
  button.setAttribute(
    "aria-pressed",
    String(button.classList.contains("active"))
  );

  button.addEventListener("click", () => {
    activeCategory = button.dataset.filter || "all";

    filterButtons.forEach((item) => {
      const isActive = item === button;

      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    filterProducts();
  });
});

// 7. RESET FORMULIR
function resetOrderForm() {
  if (selectedProduct) {
    selectedProduct.value = "";
  }

  if (dynamicFields) {
    dynamicFields.replaceChildren();
  }

  if (denomination) {
    denomination.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Pilih nominal";

    denomination.appendChild(placeholder);
    denomination.disabled = true;
  }

  if (customerNote) {
    customerNote.value = "";
  }

  hideMessage();
}

// 8. FORM IDENTITAS PRODUK
function renderProductFields(productName) {
  const product = products[productName];

  if (
    !product ||
    !selectedProduct ||
    !dynamicFields ||
    !denomination
  ) {
    showMessage(
      "Formulir belum siap. Silakan muat ulang halaman."
    );
    return false;
  }

  selectedProduct.value = productName;
  dynamicFields.replaceChildren();
  denomination.replaceChildren();

  product.fields.forEach((field) => {
    const wrapper = document.createElement("div");
    wrapper.className = "form-group";

    const label = document.createElement("label");
    const input = document.createElement("input");

    input.id = `customer-${field.name}`;
    input.name = field.name;
    input.type = "text";
    input.inputMode = field.inputMode || "text";
    input.placeholder = field.placeholder;
    input.required = field.required;
    input.autocomplete = "off";
    input.maxLength =
      field.inputMode === "tel" ? 20 : 40;

    label.htmlFor = input.id;
    label.textContent = field.label;

    wrapper.append(label, input);
    dynamicFields.appendChild(wrapper);
  });

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Pilih nominal";
  placeholder.selected = true;

  denomination.appendChild(placeholder);

  product.denominations.forEach(([name, price]) => {
    const option = document.createElement("option");

    option.value = name;
    option.textContent =
      `${name} | Harga contoh ${rupiah(price)}`;

    option.dataset.price = String(price);
    denomination.appendChild(option);
  });

  denomination.disabled = false;
  denomination.value = "";

  hideMessage();
  return true;
}

// 9. TOMBOL PILIH PRODUK
document.querySelectorAll(".order-button").forEach((button) => {
  button.addEventListener("click", () => {
    const productName = button.dataset.product;

    if (!products[productName]) {
      alert(
        "Produk tidak ditemukan. Periksa nama produk pada HTML."
      );
      return;
    }

    if (renderProductFields(productName)) {
      orderSection?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      const firstInput = dynamicFields?.querySelector("input");

      if (firstInput) {
        window.setTimeout(() => {
          firstInput.focus({ preventScroll: true });
        }, 350);
      }
    }
  });
});

// 10. KIRIM PESANAN KE CLOUDFLARE WORKER
orderForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (submittingOrder) return;

  const productName = selectedProduct?.value || "";
  const product = products[productName];

  if (!product) {
    alert("Pilih produk dari katalog terlebih dahulu.");
    return;
  }

  if (!orderForm.reportValidity()) return;

  const selectedOption = denomination?.selectedOptions?.[0];

  if (!selectedOption?.value) {
    alert("Pilih nominal produk terlebih dahulu.");
    denomination?.focus();
    return;
  }

  for (const field of product.fields) {
    const input = orderForm.elements.namedItem(field.name);

    if (
      field.required &&
      (!input || !input.value.trim())
    ) {
      alert(`Kolom "${field.label}" wajib diisi.`);
      input?.focus();
      return;
    }
  }

  const examplePrice = Number(
    selectedOption.dataset.price || 0
  );

  if (!Number.isFinite(examplePrice) || examplePrice <= 0) {
    alert("Harga contoh tidak valid.");
    return;
  }

  // API menerima satu customer_reference.
  // Mobile Legends: USER_ID|ZONE_ID.
  // Produk lain: ID pemain, nomor HP, atau ID pelanggan.
  const customerReference = product.fields
    .filter((field) => field.required)
    .map((field) => {
      const input = orderForm.elements.namedItem(field.name);
      return input.value.trim();
    })
    .join("|");

  const payload = {
    product_code: product.code,
    denomination: selectedOption.value,
    customer_reference: customerReference
  };

  const submitButton = orderForm.querySelector(
    'button[type="submit"], input[type="submit"]'
  );

  submittingOrder = true;

  if (submitButton) {
    submitButton.disabled = true;

    if (submitButton.tagName === "BUTTON") {
      submitButton.dataset.originalText =
        submitButton.textContent;
      submitButton.textContent = "Menyimpan pesanan...";
    } else {
      submitButton.dataset.originalText = submitButton.value;
      submitButton.value = "Menyimpan pesanan...";
    }
  }

  showMessage("Mengirim pesanan ke server...");

  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.ok || !data.order?.id) {
      throw new Error(
        data.error || "Server gagal menyimpan pesanan."
      );
    }

    renderOrder(data.order);

    orderResult?.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

    console.info(
      "Lixxy Store: pesanan demo tersimpan.",
      data.order.id
    );
  } catch (error) {
    console.error("Lixxy Store API error:", error);

    showMessage(
      "Pesanan gagal dikirim. Periksa koneksi internet, " +
      "alamat Worker, dan konfigurasi CORS. " +
      (error.message || "")
    );
  } finally {
    submittingOrder = false;

    if (submitButton) {
      submitButton.disabled = false;

      if (submitButton.tagName === "BUTTON") {
        submitButton.textContent =
          submitButton.dataset.originalText ||
          "Buat Pesanan";
      } else {
        submitButton.value =
          submitButton.dataset.originalText ||
          "Buat Pesanan";
      }
    }
  }
});

// 11. TAHUN FOOTER
const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// 12. KONDISI AWAL
resetOrderForm();
filterProducts();

"use strict";

// ========================================
// LIXXYSTORE - FRONTEND DEMO
// Semua pesanan masih demo, belum transaksi asli.
// ========================================

const products = {
  "Mobile Legends": {
    fields: [
      {
        name: "userid",
        label: "User ID Mobile Legends",
        placeholder: "Masukkan User ID",
        type: "text"
      },
      {
        name: "zoneid",
        label: "Zone ID",
        placeholder: "Masukkan Zone ID",
        type: "text"
      }
    ],
    denominations: [
      { label: "86 Diamonds", value: "86 Diamonds" },
      { label: "172 Diamonds", value: "172 Diamonds" },
      { label: "257 Diamonds", value: "257 Diamonds" },
      { label: "344 Diamonds", value: "344 Diamonds" },
      { label: "706 Diamonds", value: "706 Diamonds" },
      { label: "Weekly Diamond Pass", value: "Weekly Diamond Pass" }
    ]
  },

  "Free Fire": {
    fields: [
      {
        name: "playerid",
        label: "Player ID Free Fire",
        placeholder: "Masukkan Player ID",
        type: "text"
      }
    ],
    denominations: [
      { label: "5 Diamonds", value: "5 Diamonds" },
      { label: "12 Diamonds", value: "12 Diamonds" },
      { label: "50 Diamonds", value: "50 Diamonds" },
      { label: "70 Diamonds", value: "70 Diamonds" },
      { label: "140 Diamonds", value: "140 Diamonds" },
      { label: "355 Diamonds", value: "355 Diamonds" },
      { label: "720 Diamonds", value: "720 Diamonds" }
    ]
  },

  "DANA": {
    fields: [
      {
        name: "phone",
        label: "Nomor HP akun DANA",
        placeholder: "Contoh: 08xxxxxxxxxx",
        type: "tel"
      }
    ],
    denominations: [
      { label: "Saldo Rp10.000", value: "Saldo Rp10.000" },
      { label: "Saldo Rp20.000", value: "Saldo Rp20.000" },
      { label: "Saldo Rp50.000", value: "Saldo Rp50.000" },
      { label: "Saldo Rp100.000", value: "Saldo Rp100.000" }
    ]
  },

  "ShopeePay": {
    fields: [
      {
        name: "phone",
        label: "Nomor HP akun ShopeePay",
        placeholder: "Contoh: 08xxxxxxxxxx",
        type: "tel"
      }
    ],
    denominations: [
      { label: "Saldo Rp10.000", value: "Saldo Rp10.000" },
      { label: "Saldo Rp20.000", value: "Saldo Rp20.000" },
      { label: "Saldo Rp50.000", value: "Saldo Rp50.000" },
      { label: "Saldo Rp100.000", value: "Saldo Rp100.000" }
    ]
  },

  "Token PLN": {
    fields: [
      {
        name: "plnid",
        label: "ID Pelanggan atau Nomor Meter",
        placeholder: "Masukkan nomor pelanggan",
        type: "text"
      }
    ],
    denominations: [
      { label: "Token Rp20.000", value: "Token Rp20.000" },
      { label: "Token Rp50.000", value: "Token Rp50.000" },
      { label: "Token Rp100.000", value: "Token Rp100.000" },
      { label: "Token Rp200.000", value: "Token Rp200.000" },
      { label: "Token Rp500.000", value: "Token Rp500.000" },
      { label: "Token Rp1.000.000", value: "Token Rp1.000.000" }
    ]
  }
};

// Elemen halaman
const searchInput = document.getElementById("searchInput");
const productCards = document.querySelectorAll(".product-card");
const emptyMessage = document.getElementById("emptyMessage");
const selectedProduct = document.getElementById("selectedProduct");
const dynamicFields = document.getElementById("dynamicFields");
const denomination = document.getElementById("denomination");
const orderForm = document.getElementById("orderForm");
const orderResult = document.getElementById("orderResult");

// Tahun footer
document.getElementById("year").textContent =
  new Date().getFullYear();

// Pencarian produk
searchInput.addEventListener("input", function () {
  const keyword = this.value.trim().toLowerCase();
  let visibleCount = 0;

  productCards.forEach(function (card) {
    const searchableText =
      (card.dataset.search || "") + " " + card.textContent;

    const matches = searchableText
      .toLowerCase()
      .includes(keyword);

    card.hidden = !matches;

    if (matches) {
      visibleCount++;
    }
  });

  emptyMessage.hidden = visibleCount !== 0;
});

// Buat input berdasarkan produk yang dipilih
function renderProductFields(productName) {
  const product = products[productName];

  if (!product) return;

  selectedProduct.value = productName;
  dynamicFields.replaceChildren();

  product.fields.forEach(function (field) {
    const label = document.createElement("label");
    label.htmlFor = "field-" + field.name;
    label.textContent = field.label;

    const input = document.createElement("input");
    input.id = "field-" + field.name;
    input.name = field.name;
    input.type = field.type;
    input.placeholder = field.placeholder;
    input.autocomplete = "off";
    input.required = true;
    input.maxLength = 60;

    dynamicFields.append(label, input);
  });

  // Isi pilihan nominal
  denomination.replaceChildren();

  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = "Pilih nominal";
  denomination.appendChild(firstOption);

  product.denominations.forEach(function (item) {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    denomination.appendChild(option);
  });

  orderResult.hidden = true;
}

// Tombol pilih produk
document.querySelectorAll(".order-button").forEach(function (button) {
  button.addEventListener("click", function () {
    const productName = this.dataset.product;

    renderProductFields(productName);

    document.getElementById("pesanan").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

// Buat nomor pesanan demo
function createDemoOrderId() {
  const timePart = Date.now().toString().slice(-8);
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return "LXS-" + timePart + "-" + randomPart;
}

// Proses formulir demo
orderForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!orderForm.reportValidity()) return;

  const productName = selectedProduct.value;
  const selectedNominal = denomination.value;

  if (!products[productName] || !selectedNominal) {
    alert("Silakan pilih produk dan nominal terlebih dahulu.");
    return;
  }

  const formData = new FormData(orderForm);
  const orderId = createDemoOrderId();

  const order = {
    orderId: orderId,
    product: productName,
    denomination: selectedNominal,
    createdAt: new Date().toLocaleString("id-ID"),
    status: "DEMO - BELUM DIBAYAR"
  };

  products[productName].fields.forEach(function (field) {
    order[field.name] = String(
      formData.get(field.name) || ""
    ).trim();
  });

  const note = String(formData.get("note") || "").trim();

  // Tampilkan hasil di halaman tanpa mengirim data ke server.
  orderResult.replaceChildren();

  const title = document.createElement("strong");
  title.textContent = "Pesanan demo berhasil dibuat!";

  const details = document.createElement("p");
  details.style.marginTop = "10px";
  details.style.lineHeight = "1.9";

  details.textContent =
    "Nomor pesanan: " + order.orderId +
    "\nProduk: " + order.product +
    "\nNominal: " + order.denomination +
    "\nWaktu: " + order.createdAt +
    "\nStatus: " + order.status +
    (note ? "\nCatatan: " + note : "");

  const warning = document.createElement("p");
  warning.style.marginTop = "12px";
  warning.textContent =
    "Ini hanya simulasi di perangkat kamu. " +
    "Pesanan tidak tersimpan di server, " +
    "tidak ada pembayaran, dan produk tidak dikirim.";

  orderResult.append(title, details, warning);
  orderResult.hidden = false;

  orderResult.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  console.log("LixxyStore demo order:", order);
});

console.log("LixxyStore siap dalam mode demo.");
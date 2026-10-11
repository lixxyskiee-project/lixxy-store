/* ==========================================
LIXXY STORE | SCRIPT UTAMA
Cocok dengan index.html dan style.css
Mode demo, belum ada transaksi sungguhan
========================================== */

"use strict";

// 1. KATALOG PRODUK
const products = {
"Mobile Legends": {
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

// 2. AMBIL ELEMEN HTML
const searchInput = document.getElementById("searchInput");
const productCards = [...document.querySelectorAll(".product-card")];
const filterButtons = [...document.querySelectorAll(".filter-button")];
const emptyMessage = document.getElementById("emptyMessage");

const orderForm = document.getElementById("orderForm");
const selectedProduct = document.getElementById("selectedProduct");
const dynamicFields = document.getElementById("dynamicFields");
const denomination = document.getElementById("denomination");
const orderResult = document.getElementById("orderResult");
const customerNote = document.getElementById("customerNote");
const orderSection = document.getElementById("pesanan");

let activeCategory = "all";

// 3. UTILITAS
function rupiah(amount) {
return new Intl.NumberFormat("id-ID", {
style: "currency",
currency: "IDR",
maximumFractionDigits: 0
}).format(amount);
}

function showMessage(message) {
if (!orderResult) return;

orderResult.textContent = message;
orderResult.hidden = false;
}

function hideMessage() {
if (!orderResult) return;

orderResult.textContent = "";
orderResult.hidden = true;
}

// 4. PENCARIAN DAN FILTER KATEGORI
function filterProducts() {
const query = (searchInput?.value || "").trim().toLowerCase();
let visibleCount = 0;

productCards.forEach((card) => {
const productName = card.querySelector("h3")?.textContent || "";
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

// 5. RESET FORMULIR
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
denomination.value = "";

}

if (customerNote) {
customerNote.value = "";
}

hideMessage();
}

// 6. MEMBANGUN FORM BERDASARKAN PRODUK
function renderProductFields(productName) {
const product = products[productName];

if (!product || !selectedProduct || !dynamicFields || !denomination) {
showMessage("Formulir belum siap. Silakan muat ulang halaman.");
return false;
}

selectedProduct.value = productName;
dynamicFields.replaceChildren();
denomination.replaceChildren();

// Kolom identitas sesuai produk
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
input.maxLength = field.inputMode === "tel" ? 20 : 40;

label.htmlFor = input.id;
label.textContent = field.label;

wrapper.append(label, input);
dynamicFields.appendChild(wrapper);

});

// Pengguna harus memilih nominal secara sadar
const placeholder = document.createElement("option");
placeholder.value = "";
placeholder.textContent = "Pilih nominal";
placeholder.selected = true;

denomination.appendChild(placeholder);

product.denominations.forEach(([name, price]) => {
const option = document.createElement("option");

option.value = name;
option.textContent = `${name} | Harga contoh ${rupiah(price)}`;
option.dataset.price = String(price);

denomination.appendChild(option);

});

denomination.disabled = false;
denomination.value = "";

hideMessage();
return true;
}

// 7. TOMBOL PILIH PRODUK
document.querySelectorAll(".order-button").forEach((button) => {
button.addEventListener("click", () => {
const productName = button.dataset.product;

if (!products[productName]) {
  alert("Produk tidak ditemukan. Periksa nama produk pada HTML.");
  return;
}

const success = renderProductFields(productName);

if (!success) return;

orderSection?.scrollIntoView({
  behavior: "smooth",
  block: "start"
});

// Fokus ke kolom pertama tanpa memaksa halaman melompat lagi.
const firstInput = dynamicFields?.querySelector("input");

if (firstInput) {
  window.setTimeout(() => {
    firstInput.focus({ preventScroll: true });
  }, 350);
}

});
});

// 8. KIRIM FORMULIR DEMO
orderForm?.addEventListener("submit", (event) => {
event.preventDefault();

const productName = selectedProduct?.value || "";
const product = products[productName];

if (!product) {
alert("Pilih produk dari katalog terlebih dahulu.");
return;
}

if (!orderForm.reportValidity()) return;

const selectedOption = denomination?.selectedOptions?.[0];

if (!selectedOption || !selectedOption.value) {
alert("Pilih nominal produk terlebih dahulu.");
denomination?.focus();
return;
}

// Periksa kolom wajib sekali lagi.
for (const field of product.fields) {
const input = orderForm.elements.namedItem(field.name);

if (field.required && (!input || !input.value.trim())) {
  alert(`Kolom "${field.label}" wajib diisi.`);
  input?.focus();
  return;
}

}

const examplePrice = Number(selectedOption.dataset.price || 0);

if (!Number.isFinite(examplePrice) || examplePrice <= 0) {
alert("Harga contoh tidak valid. Silakan pilih nominal kembali.");
return;
}

const details = {
product: productName,
denomination: selectedOption.value,
examplePrice: rupiah(examplePrice)
};

product.fields.forEach((field) => {
const input = orderForm.elements.namedItem(field.name);

if (input && input.value.trim()) {
  details[field.label] = input.value.trim();
}

});

if (customerNote?.value.trim()) {
details.note = customerNote.value.trim();
}

showMessage(
  `DEMO BERHASIL! Produk: ${details.product}. ` +
  `Nominal: ${details.denomination}. ` +
  `Harga contoh: ${details.examplePrice}. ` +
  "Ini hanya simulasi. Pesanan tidak dikirim ke server, " +
  "tidak dibayar, dan tidak diproses."
);

orderResult?.scrollIntoView({
behavior: "smooth",
block: "nearest"
});

// Data hanya ditampilkan di konsol lokal untuk pengujian.
// Tidak ada permintaan jaringan atau penyimpanan server.
console.info("Lixxy Store demo berhasil dijalankan.");
});

// 9. TAHUN FOOTER
const yearElement = document.getElementById("year");

if (yearElement) {
yearElement.textContent = new Date().getFullYear();
}

// 10. KONDISI AWAL HALAMAN
resetOrderForm();
filterProducts();

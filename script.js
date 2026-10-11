let stocks = {
  keyholder: 40,
  bane: 24,
  zipper: 15
};

const initialStocks = {
  keyholder: 40,
  bane: 24,
  zipper: 15
};


// 商品名
let itemNames = {
  keyholder: "キーホルダー",
  bane: "バネ口ポーチ",
  zipper: "ファスナーポーチ"
};


// 保存されている商品名を読み込む
const savedItemNames =
  localStorage.getItem("itemNames");

if (savedItemNames) {
  itemNames = JSON.parse(savedItemNames);
}


// --------------------
// 保存データを読み込む
// --------------------

const savedStocks = localStorage.getItem("stocks");

if (savedStocks) {
  stocks = JSON.parse(savedStocks);
}


let history =
  JSON.parse(localStorage.getItem("stockHistory")) || [];


// --------------------
// 在庫表示
// --------------------

function showStocks() {

  document.getElementById("keyholder").textContent =
    stocks.keyholder;

  document.getElementById("bane").textContent =
    stocks.bane;

  document.getElementById("zipper").textContent =
    stocks.zipper;
}


// --------------------
// ＋1 / −1
// --------------------

function changeStock(itemName, amount, type) {

  const newStock = stocks[itemName] + amount;

  if (newStock < 0) {
    alert("在庫は0個より少なくできません");
    return;
  }

  stocks[itemName] = newStock;

  addHistory(itemName, type, amount);

  saveData();
}


// --------------------
// まとめて登録
// --------------------

function changeBulkStock(
  itemName,
  inputId,
  typeId
) {

  const input =
    document.getElementById(inputId);

  const type =
    document.getElementById(typeId).value;

  const amount =
    Number(input.value);


  if (!amount || amount <= 0) {

    alert("1以上の数字を入力してください");

    return;
  }


  let changeAmount = amount;


  // 販売・注文なら在庫を減らす
  if (type === "販売" || type === "注文") {

    changeAmount = -amount;
  }


  const newStock =
    stocks[itemName] + changeAmount;


  if (newStock < 0) {

    alert("在庫数が足りません");

    return;
  }


  stocks[itemName] = newStock;


  addHistory(
    itemName,
    type,
    changeAmount
  );


  saveData();


  input.value = "";
}


// --------------------
// 履歴追加
// --------------------

function addHistory(
  itemName,
  type,
  amount
) {

  const now = new Date();


  const record = {

    date: now.toLocaleString("ja-JP"),

    item: itemNames[itemName],

    type: type,

    amount: amount

  };


  history.unshift(record);
}


// --------------------
// 保存
// --------------------

function saveData() {

  localStorage.setItem(
    "stocks",
    JSON.stringify(stocks)
  );

  localStorage.setItem(
    "stockHistory",
    JSON.stringify(history)
  );

// Firebaseにも保存
if (window.firebaseDB) {
  const { database, ref, set } = window.firebaseDB;

  set(
    ref(database, "pipiData"),
    {
      stocks: stocks,
      history: history,
      itemNames: itemNames,
      productionTargets:
        JSON.parse(localStorage.getItem("productionTargets")) || {}
    }
  ).catch(function(error) {
    console.error("Firebase保存エラー:", error);
  });
}

  showStocks();

  showHistory();

  showProduction();

  showCustomItems();
}


// --------------------
// 履歴表示
// --------------------

function showHistory() {

  const historyArea =
    document.getElementById("history");


  historyArea.innerHTML = "";


  if (history.length === 0) {

    historyArea.innerHTML =
      "<p>まだ履歴はありません。</p>";

    return;
  }


  history.forEach(function(record) {

    const row =
      document.createElement("div");


    let amountText = record.amount;


    if (record.amount > 0) {

      amountText = "+" + record.amount;

    }


    row.textContent =
      record.date +
      " ｜ " +
      record.item +
      " ｜ " +
      record.type +
      " ｜ " +
      amountText;


    historyArea.appendChild(row);

  });
}


// --------------------
// 在庫リセット
// --------------------

function resetStocks() {

  stocks = {
    ...initialStocks
  };


  localStorage.setItem(
    "stocks",
    JSON.stringify(stocks)
  );


  showStocks();
}


// --------------------
// 履歴削除
// --------------------

function clearHistory() {

  history = [];


  localStorage.removeItem(
    "stockHistory"
  );


  showHistory();
}


showStocks();

showHistory();

showCustomItems();

// --------------------
// 画面切り替え
// --------------------

function showPage(pageId, button) {

  // すべての画面を非表示
  const pages = document.querySelectorAll(".page");

  pages.forEach(function(page) {
    page.classList.remove("active-page");
  });


  // 選択した画面を表示
  document
    .getElementById(pageId)
    .classList.add("active-page");


  // すべてのメニューボタンからactiveを外す
  const buttons =
    document.querySelectorAll(".nav-button");

  buttons.forEach(function(navButton) {
    navButton.classList.remove("active");
  });


  // 押したボタンを選択状態にする
  button.classList.add("active");

if (pageId === "productionPage") {

  showProduction();

  showCustomProductionItems();
}

}

// --------------------
// 制作管理
// --------------------

// 保存されている目標数を読み込む
const savedProductionTargets =
  JSON.parse(localStorage.getItem("productionTargets"));

if (savedProductionTargets) {

  document.getElementById("keyholderTarget").value =
    savedProductionTargets.keyholder;

  document.getElementById("baneTarget").value =
    savedProductionTargets.bane;

  document.getElementById("zipperTarget").value =
    savedProductionTargets.zipper;
}

function showProduction() {

  // 現在庫
  document.getElementById("keyholderCurrent").textContent =
    stocks.keyholder;

  document.getElementById("baneCurrent").textContent =
    stocks.bane;

  document.getElementById("zipperCurrent").textContent =
    stocks.zipper;


  // 入力されている目標数を取得
  const keyholderTarget =
    Number(document.getElementById("keyholderTarget").value);

  const baneTarget =
    Number(document.getElementById("baneTarget").value);

  const zipperTarget =
    Number(document.getElementById("zipperTarget").value);


  // 残り制作数
  const keyholderRemaining =
    Math.max(
      keyholderTarget - stocks.keyholder,
      0
    );

  const baneRemaining =
    Math.max(
      baneTarget - stocks.bane,
      0
    );

  const zipperRemaining =
    Math.max(
      zipperTarget - stocks.zipper,
      0
    );


  document.getElementById("keyholderRemaining").textContent =
    keyholderRemaining;

  document.getElementById("baneRemaining").textContent =
    baneRemaining;

  document.getElementById("zipperRemaining").textContent =
    zipperRemaining;
}


// 目標数を変更したら残りを再計算
function saveProductionTargets() {

 const targets =
  JSON.parse(
    localStorage.getItem("productionTargets")
  ) || {};

targets.keyholder =
  Number(document.getElementById("keyholderTarget").value);

targets.bane =
  Number(document.getElementById("baneTarget").value);

targets.zipper =
  Number(document.getElementById("zipperTarget").value);

  localStorage.setItem(
    "productionTargets",
    JSON.stringify(targets)
  );

// Firebaseにも制作目標を保存
if (window.firebaseDB) {
  const { database, ref, set } = window.firebaseDB;

  set(
    ref(database, "pipiData/productionTargets"),
    targets
  ).catch(function(error) {
    console.error("制作目標のFirebase保存エラー:", error);
  });
}

  showProduction();
}


document.getElementById("keyholderTarget")
  .addEventListener("input", saveProductionTargets);

document.getElementById("baneTarget")
  .addEventListener("input", saveProductionTargets);

document.getElementById("zipperTarget")
  .addEventListener("input", saveProductionTargets);

  // --------------------
// 商品追加フォーム
// --------------------

function showAddItemForm() {

  document.getElementById("addItemForm").style.display =
    "block";

  document.getElementById("addItemButton").style.display =
    "none";
}


function hideAddItemForm() {

  document.getElementById("addItemForm").style.display =
    "none";

  document.getElementById("addItemButton").style.display =
    "inline-block";


  // 入力内容を元に戻す
  document.getElementById("newItemName").value =
    "";

  document.getElementById("newItemStock").value =
    0;
}

// --------------------
// 新しい商品を追加
// --------------------

function addNewItem() {

  const name =
    document.getElementById("newItemName").value.trim();

  const stock =
    Number(document.getElementById("newItemStock").value);


  // 商品名が空の場合
  if (!name) {
    alert("商品名を入力してください");
    return;
  }


  // 在庫数の確認
  if (stock < 0) {
    alert("在庫数は0以上にしてください");
    return;
  }


  // 商品IDを作成
  const itemId =
    "item_" + Date.now();


  // 商品名を登録
  itemNames[itemId] = name;


  // 在庫を登録
  stocks[itemId] = stock;


  // 保存
  localStorage.setItem(
    "itemNames",
    JSON.stringify(itemNames)
  );

  localStorage.setItem(
    "stocks",
    JSON.stringify(stocks)
  );

// Firebaseにも追加商品を保存
if (window.firebaseDB) {
  const { database, ref, set } = window.firebaseDB;

  set(
    ref(database, "pipiData/itemNames/" + itemId),
    name
  );

  set(
    ref(database, "pipiData/stocks/" + itemId),
    stock
  ).catch(function(error) {
    console.error("追加商品のFirebase保存エラー:", error);
  });
}

saveData();

hideAddItemForm();

showCustomItems();

alert(name + "を追加しました");
}

// --------------------
// 追加商品の表示
// --------------------

function showCustomItems() {

  const area =
    document.getElementById("customItems");

  area.innerHTML = "";


  Object.keys(itemNames).forEach(function(itemId) {

    // 最初からある3商品は表示しない
    if (
      itemId === "keyholder" ||
      itemId === "bane" ||
      itemId === "zipper"
    ) {
      return;
    }


    const item =
      document.createElement("div");

    item.className = "item";


  item.innerHTML = `
  <p>${itemNames[itemId]}</p>

  <button
    onclick="changeStock('${itemId}', -1, '販売')"
  >
    −
  </button>

  <span id="${itemId}">
    ${stocks[itemId] ?? 0}
  </span>

  <span>個</span>

  <button
    onclick="changeStock('${itemId}', 1, '制作')"
  >
    ＋
  </button>


  <div class="bulk-area">

    <input
      type="number"
      id="${itemId}Amount"
      min="1"
      placeholder="個数"
    >

    <select id="${itemId}Type">
      <option value="制作">制作</option>
      <option value="販売">販売</option>
      <option value="注文">注文</option>
      <option value="修正">在庫修正</option>
    </select>

    <button
      onclick="changeBulkStock(
        '${itemId}',
        '${itemId}Amount',
        '${itemId}Type'
      )"
    >
      登録
    </button>

  </div>
`;  

const deleteButton =
  document.createElement("button");

deleteButton.textContent = "削除";
deleteButton.className = "delete-button";

deleteButton.onclick = function() {
  deleteCustomItem(itemId);
};

item.appendChild(deleteButton);

    area.appendChild(item);
  });
}
function deleteCustomItem(itemId) {

  const name = itemNames[itemId];

  const ok = confirm(
    name + "を削除しますか？"
  );

  if (!ok) {
    return;
  }

  // データから削除
  delete itemNames[itemId];
  delete stocks[itemId];

  const targets =
    JSON.parse(
      localStorage.getItem("productionTargets")
    ) || {};

  delete targets[itemId];

  // ローカル保存
  localStorage.setItem(
    "itemNames",
    JSON.stringify(itemNames)
  );

  localStorage.setItem(
    "stocks",
    JSON.stringify(stocks)
  );

  localStorage.setItem(
    "productionTargets",
    JSON.stringify(targets)
  );

  // Firebaseからも削除
  if (window.firebaseDB) {
    const { database, ref, set } = window.firebaseDB;

    set(
      ref(database, "pipiData/itemNames/" + itemId),
      null
    );

    set(
      ref(database, "pipiData/stocks/" + itemId),
      null
    );

    set(
      ref(database, "pipiData/productionTargets/" + itemId),
      null
    );
  }

  showCustomItems();
  showProduction();
}

// --------------------
// 追加商品の制作管理
// --------------------

function showCustomProductionItems() {

  const area =
    document.getElementById("customProductionItems");

  area.innerHTML = "";


  Object.keys(itemNames).forEach(function(itemId) {

    // 最初からある3商品は除外
    if (
      itemId === "keyholder" ||
      itemId === "bane" ||
      itemId === "zipper"
    ) {
      return;
    }


    // 保存されている目標数を取得
    const savedTargets =
      JSON.parse(
        localStorage.getItem("productionTargets")
      ) || {};


    const target =
      savedTargets[itemId] ?? 0;

    const current =
      stocks[itemId] ?? 0;

    const remaining =
      Math.max(target - current, 0);


    const card =
      document.createElement("div");

    card.className = "production-card";


    card.innerHTML = `
      <h3>${itemNames[itemId]}</h3>

      <div class="production-numbers">

        <div>
          <small>目標</small>

          <strong>
            <input
              type="number"
              id="${itemId}Target"
              value="${target}"
              min="0"
              class="target-input"
              oninput="saveCustomProductionTarget('${itemId}')"
            >個
          </strong>
        </div>


        <div>
          <small>現在庫</small>

          <strong>
            <span>${current}</span>個
          </strong>
        </div>


        <div>
          <small>残り</small>

          <strong>
            <span>${remaining}</span>個
          </strong>
        </div>

      </div>

    `;


    area.appendChild(card);

  });
}

function saveCustomProductionTarget(itemId) {
  const targets =
    JSON.parse(
      localStorage.getItem("productionTargets")
    ) || {};


  targets[itemId] =
    Number(
      document.getElementById(
        itemId + "Target"
      ).value
    );


  localStorage.setItem(
    "productionTargets",
    JSON.stringify(targets)
  );
// Firebaseにも制作目標を保存
if (window.firebaseDB) {
  const { database, ref, set } = window.firebaseDB;

  set(
    ref(database, "pipiData/productionTargets"),
    targets
  ).catch(function(error) {
    console.error("追加商品の制作目標のFirebase保存エラー:", error);
  });
}

  showCustomProductionItems();
}

// --------------------
// Firebaseからデータを読み込む
// --------------------
function loadFirebaseData() {

  if (!window.firebaseDB) {
    console.log("Firebaseの準備待ち...");
    setTimeout(loadFirebaseData, 500);
    return;
  }

  const { database, ref, onValue } = window.firebaseDB;

  const dataRef = ref(database, "pipiData");

  onValue(dataRef, function(snapshot) {

    const data = snapshot.val();

    if (!data) {
      console.log("Firebaseにデータはまだありません");
      return;
    }

if (data.itemNames) {
  itemNames = data.itemNames;

  localStorage.setItem(
    "itemNames",
    JSON.stringify(itemNames)
  );
}

    if (data.stocks) {
      stocks = data.stocks;

      localStorage.setItem(
        "stocks",
        JSON.stringify(stocks)
      );
    }

    if (data.history) {
      history = data.history;

      localStorage.setItem(
        "stockHistory",
        JSON.stringify(history)
      );
    }
if (data.productionTargets) {
  localStorage.setItem(
    "productionTargets",
    JSON.stringify(data.productionTargets)
  );

  document.getElementById("keyholderTarget").value =
    data.productionTargets.keyholder;

  document.getElementById("baneTarget").value =
    data.productionTargets.bane;

  document.getElementById("zipperTarget").value =
    data.productionTargets.zipper;
}

if (data.events) {
  events = data.events;

  localStorage.setItem(
    "events",
    JSON.stringify(events)
  );
}

    showStocks();
    showHistory();
    showProduction();
    showCustomItems();
    showEvents();

    console.log("Firebaseから読み込みました");
  });
}

// --------------------
// イベント管理
// --------------------

let events =
  JSON.parse(localStorage.getItem("events")) || [];
 
let editingEventId = null;

function addEvent() {

  const name =
    document.getElementById("eventName").value.trim();

  const date =
    document.getElementById("eventDate").value;

  const place =
    document.getElementById("eventPlace").value.trim();

  const fee =
    document.getElementById("eventFee").value;

  const memo =
    document.getElementById("eventMemo").value.trim();

  if (name === "") {
    alert("イベント名を入力してください");
    return;
  }

 if (editingEventId !== null) {

  const event = events.find(function(event) {
    return event.id === editingEventId;
  });

  if (event) {
    event.name = name;
    event.date = date;
    event.place = place;
    event.fee = fee;
    event.memo = memo;
  }

} else {

  const event = {
    id: Date.now(),
    name: name,
    date: date,
    place: place,
    fee: fee,
    memo: memo
  };

  events.push(event);
}

  localStorage.setItem(
    "events",
    JSON.stringify(events)
  );

  // Firebaseにもイベントを保存
if (window.firebaseDB) {
  const { database, ref, set } = window.firebaseDB;

  set(
    ref(database, "pipiData/events"),
    events
  ).catch(function(error) {
    console.error("イベント保存エラー:", error);
  });
}

  showEvents();

  document.getElementById("eventName").value = "";
  document.getElementById("eventDate").value = "";
  document.getElementById("eventPlace").value = "";
  document.getElementById("eventFee").value = "";
  document.getElementById("eventMemo").value = "";
  editingEventId = null;

document.getElementById("eventSubmitButton").textContent = "登録";
document.getElementById("eventCancelEditButton").style.display = "none";
}

function showEvents() {

  const eventList =
    document.getElementById("eventList");

  if (!eventList) {
    return;
  }

  eventList.innerHTML = "";

  if (events.length === 0) {
    eventList.innerHTML =
      "<p>まだイベントは登録されていません。</p>";
    return;
  }

  events.forEach(function(event) {

    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <h3>${event.name}</h3>
      <p>📅 ${event.date || "未設定"}</p>
      <p>📍 ${event.place || "未設定"}</p>
      <p>💰 出店料：${event.fee ? event.fee + "円" : "未設定"}</p>
      <p>📝 ${event.memo || "メモなし"}</p>
      <button class="event-edit-button" onclick="editEvent(${event.id})">編集</button>
      <button class="event-delete-button" onclick="deleteEvent(${event.id})">削除</button>
    `;

    eventList.appendChild(card);
  });
}

function deleteEvent(id) {

  const result = confirm(
    "このイベントを削除しますか？"
  );

  if (!result) {
    return;
  }

  events = events.filter(function(event) {
    return event.id !== id;
  });

  localStorage.setItem(
    "events",
    JSON.stringify(events)
  );

  // Firebaseにも削除後のイベント一覧を保存
if (window.firebaseDB) {
  const { database, ref, set } = window.firebaseDB;

  set(
    ref(database, "pipiData/events"),
    events
  ).catch(function(error) {
    console.error("イベント削除エラー:", error);
  });
}
  showEvents();
}

function editEvent(id) {

  const event = events.find(function(event) {
    return event.id === id;
  });

  if (!event) {
    return;
  }

  editingEventId = id;

document.getElementById("eventSubmitButton").textContent = "更新する";
document.getElementById("eventCancelEditButton").style.display = "block";

  document.getElementById("eventName").value =
    event.name || "";

  document.getElementById("eventDate").value =
    event.date || "";

  document.getElementById("eventPlace").value =
    event.place || "";

  document.getElementById("eventFee").value =
    event.fee || "";

  document.getElementById("eventMemo").value =
    event.memo || "";

  setTimeout(function() {
  document.querySelector(".event-form").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}, 100);

}

function cancelEventEdit() {

  editingEventId = null;

  document.getElementById("eventName").value = "";
  document.getElementById("eventDate").value = "";
  document.getElementById("eventPlace").value = "";
  document.getElementById("eventFee").value = "";
  document.getElementById("eventMemo").value = "";

  document.getElementById("eventSubmitButton").textContent = "登録";
  document.getElementById("eventCancelEditButton").style.display = "none";
}

showEvents();

loadFirebaseData();
firebase.auth().onAuthStateChanged((user) => {
    let login_set = document.querySelector('#login_set');

    if (user) {
        login_set.innerHTML = '<a class="nav-link active" aria-current="page" href="/login/login.html" id="uname"></a>';
        console.log(user);
    }
    else {
        login_set.innerHTML = '<a class="nav-link active" aria-current="page" href=""></a>';
    }

});

/**
 * メッセージ表示
 **/
function showMessage(title, msg) {
    document.querySelector('h1').innerText = title;
    document.querySelector('#info').innerText = msg;
}

var Chat = {
    user: {
        name: null
    },
    db: null,
    messagesRef: null,

    init: () => {
        this.db = firebase.firestore();
        this.messagesRef = this.db.collection("chatroom").doc("talk").collection("messages");

        this.messagesRef.orderBy("date", "asc").limit(20).onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {

                if (change.type === 'added') {
                    Chat.addLog(change.doc.id, change.doc.data());
                }
                else if (change.type === 'modified') {
                    Chat.modLog(change.doc.id, change.doc.data());
                }
                else if (change.type === 'removed') {
                    Chat.removeLog(change.doc.id);
                }
            });
        });

        document.getElementById("sbmt").addEventListener("click", () => {
            let msg = document.getElementById("msg").value;
            if (msg.length !== 0) {
                Chat.sendLog(msg);
            }
        });
        document.getElementById("form1").addEventListener("submit", (e) => {
            e.preventDefault();
        });
    },

    /**
     * Firestoreへ送信
     *
     * @param {string} str 送信内容
     **/
    sendLog: (str) => {
        this.messagesRef.add({
            name: Chat.user.name,
            msg: str,
            date: new Date().getTime()
        })
            .then(() => {
                let msg = document.getElementById("msg");
                msg.focus();
                msg.value = "";
            })
            .catch((error) => {
                console.log(`追加に失敗しました (${error})`);
            });
    },

    /**
     * 描画エリアにログを追加
     *
     * @param {string} id
     * @param {object} data
     **/
    addLog: (id, data) => {
        // 追加するHTMLを作成
        let log = `${data.name}: ${data.msg}`;
        let li = document.createElement('article');
        li.id = id;
        li.appendChild(document.createTextNode(log));

        // 表示エリアへ追加
        let chatlog = document.getElementById("chatlog");
        chatlog.insertBefore(li, chatlog.firstChild);
    },

    /**
     * 描画エリアのログを変更
     *
     * @param {string} id
     * @param {object} data
     **/
    modLog: (id, data) => {
        let log = document.getElementById(id);
        if (log !== null) {
            log.innerHTML = `${data.name}<br>${data.msg}`;
        }
    },

    /**
     * 描画エリアのログを削除
     *
     * @param {string} id
     **/
    removeLog: (id) => {
        let log = document.getElementById(id);
        if (log !== null) {
            log.parentNode.removeChild(log);
        }
    }
};  // Chat


/**
 * 描画エリアのログを変更
 *
 * @param {string} id
 * @param {object} data
 **/
firebase.auth().onAuthStateChanged((user) => {
    // ログイン状態なら書き込みフォームを開放
    if (user !== '匿名') {
        //表示
        document.getElementById("chatlog").classList.remove("hide");
        document.getElementById("form1").classList.remove("hide");
        // ユーザー名を確保
        Chat.user.name = user.displayName;
        document.getElementById("uname").innerText = Chat.user.name;
    }

    // Firestore処理開始
    Chat.init();
});

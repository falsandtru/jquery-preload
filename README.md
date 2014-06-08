#preload

preloadはユーザーが次に見るページを予測して先読み（事前読み込み）することでページ移動を高速化します。

##概要
カーソルの位置と動きからユーザーが次に開くページ（リンク）を予測しajaxにより事前に先読みすることでブラウザとサーバーにあらかじめキャッシュを生成しページ移動を高速化します。

```javascript
$.preload();
```

##特徴

* プリロードのajax処理を中断せずpjaxに渡せるため最速でページ移動が可能です。
* リクエストとトラフィックが最小限になるよう最適化しています。
* カーソルがリンク上にあるときのみ予測を行うため軽量です。
* プリロード数の上限と時間経過による回復を設定できます。
* プリロードの完了までページ移動を待機することができます。
* <a href="https://github.com/falsandtru/jquery.pjax.js">pjax</a>と組み合わせて使用できます。

##対応

* jQuery1.4.2+
* 複数登録
* プリロード数の上限設定
* プリロード数の時間回復
* プリロードの実行間隔の設定
* プリロード中のリンクのロック
* <a href="https://github.com/falsandtru/jquery.pjax.js">pjax</a>との連携。

##preload + pjax
preloadとpjaxの複合利用は、スクリプトファイルを置くだけでページの表示(移動)にかかる時間を約0.5秒短縮する手軽で効果の高い高速化手法です。ここで使用するpjaxは高度に自動化されているためHTMLやCSSがページごとにバラバラでも動作します。スクリプトと動的に追加される要素には注意が必要ですがpjaxの`load.reload`と`load.reject`パラメータを調整するだけでプラグインを数十個入れたWordpressのような複雑なサイトでも使用できます。ただし、タッチ操作ではpreloadを使用できず効果がいまひとつのため無効にします。

通常はリンクのクリックからHTMLファイルのダウンロード完了まで0.5～1秒、ページの表示（DOMロード）にさらに1秒の合計2秒前後かかるページ移動をpreload+pjaxではクリックからページの表示まで0.5秒（500ミリ秒）前後で完了することができます。詳細な設定項目は<a href="https://github.com/falsandtru/jquery.preload.js">preload</a>と<a href="https://github.com/falsandtru/jquery.pjax.js">pjax</a>の各ドキュメントに記載しています。PCでは多分これが一番速いと思います。

|パターン|HTMLダウンロード|DOMロード|合計|
|:---|:--:|:--:|:--:|
|Normal|500-1000ms|800-1600ms|1300-2600ms|
|preload+pjax|0-700ms|50-100ms|50-800ms|

※jQuery1.5以降のバージョン必須  
※Windows7+Chromeで手近なサイトを計測

jQueryとスクリプトを3つ追加するだけで動作します。

```html
<script charset="utf-8" src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script charset="utf-8" src="/lib/jquery.preload.js"></script>
<script charset="utf-8" src="/lib/jquery.pjax.js"></script>
<script charset="utf-8" src="/lib/accelerate.js"></script>
```

preload: [https://github.com/falsandtru/jquery.preload.js](https://github.com/falsandtru/jquery.preload.js)  
pjax: [https://github.com/falsandtru/jquery.pjax.js](https://github.com/falsandtru/jquery.pjax.js)

```javascript
// accelerate.js
if (!/touch|tablet|mobile|android|iphone|ipad|ios|windows phone|Mobile(\/\w+)? Safari/i.test(window.navigator.userAgent)) {
  $.preload({
    forward: $.pjax.follow,
    check: $.pjax.getCache,
    encode: true,
    ajax: {
      success: function ( data, textStatus, XMLHttpRequest ) {
        !$.pjax.getCache( this.url ) && $.pjax.setCache( this.url, null, textStatus, XMLHttpRequest );
      }
    }
  });
  
  $.pjax({
    area: 'body',
    load: { css: true, script: true },
    cache: { click: true, submit: false, popstate: true },
    server: { query: null },
    speedcheck: true
  });
  
  $(document).bind('pjax.ready', function() {$(document).trigger('preload');});
}
```

クリックから表示までにかかった時間をコンソールに出力します。以下の出力はクリックの493ミリ秒前にリンク先のページの取得を開始し、クリックから386ミリ秒で表示されたときのものです。

```
[-493, 10, 361, 386, 411, 490, 492, 496]
["preload(-493)", "continue(10)", "loaded(361)", "content(386)", "css(411)", "script(490)", "renderd(492)", "defer(496)"]
```

##使用法
プリロードにより高速化するためにはユーザーがカーソルを合わせてからクリックするまでの時間＋ロック時間内にプリロードが完了しなければならず、HTMLのダウンロードに要する時間（表示に要する時間ではない）をあらかじめ高速化しロック時間を平均ダウンロード時間より大きく設定する必要があります。平均ダウンロード時間が1秒を大きく超える場合はかえってページ移動が遅くなる可能性が高くなります。ダウンロード時間はブラウザのデベロッパーツールのネットワークタブなどで確認できます。

なお`forward`メソッドによりpjaxと連携させた場合はajax処理を中断しないためこの制限がありません。

###jQuery
v1.7.2の使用を推奨します。

v1.4.2から動作します。

###Register

####*$.preload( [ Setting as object ] )*
####*$.fn.preload( [ Setting as object ] )*
コンテキスト内のリンク（アンカー要素）のプリロードの予測を有効にします。コンテキストが設定されなかった場合は`document`がコンテキストに設定されます。

```javascript
$.preload();
$(document).preload();
```

###Parameter
パラメータはすべてパラメータ用オブジェクトのプロパティに設定して渡します。パラメータとなるオブジェクトのプロパティは以下のとおりです。

####*ns: Namespace as string*
ネームスペースを設定します。プリロードを複数登録する場合は設定が必要です。初期値は`null`です。

####*link: Selector as string*
コンテキスト内でプリロードの対象となるリンクをjQueryセレクタで設定します。初期値は`a:not([target])`です。

####*filter: Selector as string / function*
プリロードの対象となるリンクを絞り込むjQueryセレクタまたは関数を設定します。初期値は`function(){return /(\/[^.]*|\.html?|\.php)([#?].*)?$/.test(this.href);}`です。

####*observe: Switch as boolean*
`$.preload()`を実行後直ちにイベントハンドラを設定するかを設定します。`false`を設定した場合、`preload`イベントによりイベントハンドラを設定する必要があります。初期値は`true`です。

####*lock: Millisecond as number*
プリロード中にプリロードの対象となるリンクをロックする時間をミリ秒で設定します。ロック中のクリックはajax処理を外部に引き渡した場合を除きプリロードの完了またはロック時間が経過するまで保留されます。初期値は`1000`です。

####*forward: function( event, ajax )*
プリロード中にリンクがクリックされた場合にajax処理を引き継がせるための関数を設定します。引継ぎはリンクがロック中であるかにかかわらず直ちに行われます。第二引数は`$.ajax()`の戻り値、第三引数はプリロードの開始時間です。戻り値に`false`を設定すると引継ぎをキャンセルします。初期値は`null`です。

####*check: function( url )*
プリロードを実行するかを戻り値により設定します。コンテキストにプリロードの対象となるDOM要素が与えられます。戻り値が真偽値に変換して真であればすでにプリロード済みであるかにかかわらずプリロードを実行、偽であれば中止します。プリロード済みのページを再度キャッシュしたい場合に有用です。初期値は`null`です。

####*interval: Millisecond as numbery*
プリロードの実行間隔をミリ秒で設定します。初期値は`1000`です。

####*limit: number*
プリロードの実行回数の上限を設定します。初期値は`2`です。

####*cooldown: Millisecond as number*
プリロードを再実行可能にするまでの時間をミリ秒で設定します。初期値は`10000`です。

####*skip: Millisecond as numbery*
ブラウザキャッシュが存在するとみなす、ajaxによるページ取得に要した時間の上限をミリ秒で設定します。ブラウザキャッシュが存在するとみなす場合にはプリロードの実行回数と間隔を更新しません。初期値は`50`です。

####*query: string*
プリロードによるリクエストURLに加えるパラメータを設定します。初期値は`null`です。

####*encode: Switch as boolean*
パーセントエンコードしたURLをプリロードに使用しリンクも書き換えるかを設定します。falsandtru/jquery.pjax.jsと連携させる場合は`true`を設定してください。初期値は`false`です。

####*ajax: object*
プリロード時で実行される`$.ajax()`に与えるパラメータを設定します。初期値は`{ async: true, timeout: 1500 }`です。

###Method
なし

###Property
なし

###Event
プラグインが使用するカスタムイベントです。

####*preload*
プリロードを実行するための各種イベントハンドラを再設定します。再設定される範囲はイベントの起点により絞り込まれます。`window`オブジェクトを起点にすることはできません。ajaxやpjaxによりDOMが変更された場合は`$.preload()`を再実行せずにこのイベントを実行してください。`$.preload()`でも再設定可能ですが可読性が下がるうえ、イベントを使用した方が処理も効率的です。

##ライセンス - MIT License
以下に定める条件に従い、本ソフトウェアおよび関連文書のファイル（以下「ソフトウェア」）の複製を取得するすべての人に対し、ソフトウェアを無制限に扱うことを無償で許可します。これには、ソフトウェアの複製を使用、複写、変更、結合、掲載、頒布、サブライセンス、および/または販売する権利、およびソフトウェアを提供する相手に同じことを許可する権利も無制限に含まれます。
上記の著作権表示および本許諾表示を、ソフトウェアのすべての複製または重要な部分に記載するものとします。
ソフトウェアは「現状のまま」で、明示であるか暗黙であるかを問わず、何らの保証もなく提供されます。ここでいう保証とは、商品性、特定の目的への適合性、および権利非侵害についての保証も含みますが、それに限定されるものではありません。 作者または著作権者は、契約行為、不法行為、またはそれ以外であろうと、ソフトウェアに起因または関連し、あるいはソフトウェアの使用またはその他の扱いによって生じる一切の請求、損害、その他の義務について何らの責任も負わないものとします。

<a href="http://opensource.org/licenses/mit-license.php" target="_blank">http://opensource.org/licenses/mit-license.php</a>  
<a href="http://sourceforge.jp/projects/opensource/wiki/licenses%2FMIT_license" target="_blank">http://sourceforge.jp/projects/opensource/wiki/licenses%2FMIT_license</a>

##jQuery Plugins

###<a href="https://github.com/falsandtru/jquery.preload.js">preload</a>
ユーザーが次に見るページを予測してあらかじめ読み込みページ移動を高速化します。

###<a href="https://github.com/falsandtru/jquery.pjax.js">pjax</a>
HTML5による高速なページ移動機能をウェブサイトに実装します。

###<a href="https://github.com/falsandtru/jquery.visibilitytrigger.js">visibilitytrigger</a>
スクロールにより特定のHTML要素が画面に表示されることを条件としてスクリプトを遅延実行させます。

###<a href="https://github.com/falsandtru/jquery.clientenv.js">clientenv</a>
サイトの閲覧者のOS、ブラウザ、フォント対応などを判定してクロスブラウザ対応の労力を軽減します。

###<a href="https://github.com/falsandtru/jquery.validator.js">validator</a>
JavaScriptの動作検証とエラーレポートを行う、インストール不要の埋め込み型検証ツールです。

###<a href="https://github.com/falsandtru/jquery.spage.js">spage</a>
AutoPagerやAutoPatchWorkのようなページの自動読み込み＆継ぎ足し機能をウェブサイトに実装します。

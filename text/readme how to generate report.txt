Step by step to generate report Jmeter in HTML using component "Simple Data Writer" :

1. Tambahkan component Simple Data Writer ke dalam test plan Anda di JMeter.

2. Buat folder 'C:\jmeter\logs\test_results.jtl'
dalam hal ini saya buat disini : \D:\PERSONAL\LEARN\QA\github\jmeter-loadtest-1\report\jmeter\logs\test_results.jtl

3. Config component Simple Data Writer pada Jmeter dengan filename sesuai direktori pada step no 2
\D:\PERSONAL\LEARN\QA\github\jmeter-loadtest-1\report\jmeter\logs\test_results.jtl

4. Masuk ke direktori 'apache-jmeter\bin'
- buat folder 'report\jmeter\html' pada direktori yang diinginkan
- jalankan perintah jmeter, adapun detailnya sebagai berikut :
jmeter -g D:\PERSONAL\LEARN\QA\github\jmeter-loadtest-1\report\jmeter\logs\test_results.jtl -o D:\PERSONAL\LEARN\QA\github\jmeter-loadtest-1\report\jmeter\html

5. Buka folder 'report\jmeter\html', open file index.html di browser.

---
ref : https://jmeter.apache.org/usermanual/generating-dashboard.html#report
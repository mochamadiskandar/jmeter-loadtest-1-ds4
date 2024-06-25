# LOAD-TEST-DS4

## Create Performance Test using JMeter

### Pre-requsite

-   Install [JDK](https://www.oracle.com/id/java/technologies/downloads/#jdk22-windows) (Minimum v8)]

-   Install [Apache JMeter v5.6.3](https://jmeter.apache.org/download_jmeter.cgi)

## How To Run Test?

### Check element jmeter "CSV Data Set Config"

pastikan seluruh direktori untuk masing-masing file csv sudah benar

```text
<testplan-dir>/user_id.csv
```

### Check element jmeter "Simple Data Writer"

pastikan direktorinya sudah sesuai (Jika file test_results.jtl belum ada nanti akan otomatis dibuatkan oleh Jmeter, file ini berfungsi sebagai wadah data reporting yang nantinya akan di generate jadi bentuk report HTML)

```text
<testplan-dir>\report\jmeter\logs\test_results.jtl
```

### Run Test Plan

Jika semua element diatas sudah di Check langkah selanjutnya yaitu sesuaikan element **"Workload Config"** , kemudian click **"Run Test Plan"**

### Generating HTML Report

-   Pastikan folder html sudah dibuat.

    ```text
      (testplan-dir)\report\jmeter\html
    ```

-   Masuk ke direktori Instalasi JMeter, open direktori tersebut menggunakan cmd

    ```text
    installation-dir\apache-jmeter\bin
    ```

-   Jalankan perintah generate report

    ```bash
    jmeter -g <testplan-dir>\report\jmeter\logs\test_results.jtl -o <testplan-dir>\report\jmeter\html
    ```

### Boom!! Report is ready

Please open the **HTML** directory and open file **_.html_** in your browser.

use tauri::{command, Builder};
use std::process::Command;
use std::fs::File;
use std::io::Write;
use std::env;

#[cfg(target_os = "windows")]
#[command]
fn listar_impressoras() -> Vec<String> {
    let output = Command::new("powershell")
        .arg("-Command")
        .arg("Get-Printer | Select-Object -ExpandProperty Name")
        .output()
        .expect("Falha ao executar Get-Printer");

    let stdout = String::from_utf8_lossy(&output.stdout);
    let impressoras: Vec<String> = stdout
        .lines()
        .map(|linha| linha.trim().to_string())
        .collect();

    impressoras
}

#[cfg(target_os = "linux")]
#[command]
fn listar_impressoras() -> Vec<String> {
    let output = Command::new("lpstat")
        .arg("-p")
        .output()
        .expect("Falha ao executar lpstat");

    let stdout = String::from_utf8_lossy(&output.stdout);
    let impressoras: Vec<String> = stdout
        .lines()
        .filter(|linha| linha.starts_with("printer"))
        .map(|linha| linha.split_whitespace().nth(1).unwrap_or("").to_string())
        .collect();

    impressoras
}


#[command]
fn imprimir_pedido(impressora: String, conteudo_arquivo: String) -> String {
    // Criando arquivo temporário para impressão
    let temp_dir = env::temp_dir();
    let temp_file_path = temp_dir.join("pedido.raw");
    eprintln!("Arquivo temporário: {:?}", temp_file_path);

    match File::create(&temp_file_path) {
        Ok(mut file) => {
            eprintln!("conteudo_arquivo: {:?}", conteudo_arquivo);

            if let Err(e) = file.write_all(conteudo_arquivo.as_bytes()) {
                eprintln!("conteudo_arquivo: {:?}", conteudo_arquivo);
                return format!("Erro ao escrever arquivo: {}", e);
            }
            eprintln!("conteudo_arquivo: {:?}", conteudo_arquivo);
        }
        Err(e) => return format!("Erro ao criar arquivo: {}", e),
    }

    // Executando comando de impressão
    let output = Command::new("lp")
        .arg("-d")
        .arg(&impressora)
        .arg("-o")
        .arg("raw")
        .arg(temp_file_path.to_str().unwrap()) // Passa o caminho do arquivo para `lp`
        .output();
    eprintln!("output: {:?}", output);
    match output {
        Ok(result) => String::from_utf8_lossy(&result.stdout).to_string(),
        Err(e) => format!("Erro ao imprimir: {}", e),
    }
}

fn main() {
    Builder::default()
        .invoke_handler(tauri::generate_handler![listar_impressoras, imprimir_pedido]) // Registrar comandos
        .run(tauri::generate_context!())
        .expect("Erro ao iniciar o Tauri");
}

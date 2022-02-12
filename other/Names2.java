import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class Names2 {

	public static void main(String[] args) {
		BufferedReader reader;
		try {
			reader = new BufferedReader(new FileReader("./municipalities_raw.txt"));
			String line = reader.readLine();
			while (line != null) {
				int l1 = line.indexOf("[[");
                int l2 = line.indexOf(",");
                if(l1>0 && l2>0){
                    if(line.indexOf("Boston")>0 || line.indexOf("Nantucket")>0){
                        l2 = line.substring(l1+2).indexOf("]]") + l1 + 2;
                    }
                    System.out.print("\"" + line.substring(l1+2, l2) + "\", ");
                }
				line = reader.readLine();
			}
			reader.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}

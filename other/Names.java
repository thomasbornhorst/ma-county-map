import java.io.*;

public class Names {
	public static void main(String[] args) throws FileNotFoundException {
    // FileInputStream fstream = new FileInputStream("textfile.txt");
    // BufferedReader br = new BufferedReader(new InputStreamReader(fstream));

    // String strLine;

    // //Read File Line By Line
    // while ((strLine = br.readLine()) != null)   {
    //   // Print the content on the console
    //   System.out.println (strLine);
    // }

    // //Close the input stream
    // fstream.close();
  
      try (BufferedReader br = new BufferedReader(new FileReader("municipalities_raw.txt"))) {
      String line;
      while ((line = br.readLine()) != null) {
        int l1 = line.indexOf("[[");
        int l2 = line.indexOf(",");
        line = line.substring(l1+2, l2);
        System.out.println(line);
      }
    }catch (FileNotFoundException ex)  
    {
        // insert code to run when exception occurs
    }
	}
}

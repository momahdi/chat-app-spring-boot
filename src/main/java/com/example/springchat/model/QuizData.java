package com.example.springchat.model;

import org.json.simple.*;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class QuizData {
    public static void main(String[] args) throws IOException {


        JSONObject obj = new JSONObject();
        JSONArray qustions = new JSONArray();


        qustions.add("11%");
        qustions.add("60%");
        qustions.add("21%");
        qustions.add("no answer");

        obj.put("Q1", "Hur store del av undervisningen innehåller matte?");
        obj.put("Q1Suggestions", qustions);
        obj.put("Q1Answer", "alt3");

        ///////////////fråga 2//////////////////
        qustions = new JSONArray();

        qustions.add("12%");
        qustions.add("45%");
        qustions.add("10%");
        qustions.add("no answer");

        obj.put("Q2", "Hur store del av undervisningen innehåller programmering?");
        obj.put("Q2Suggestions", qustions);
        obj.put("Q2Answer", "alt1");

        ///////////////fråga3///////////
        qustions = new JSONArray();

        qustions.add("10%");
        qustions.add("0%");
        qustions.add("5%");
        qustions.add("no answer");

        obj.put("Q3", "Hur store del av undervisningen innehåller språk?");
        obj.put("Q3Suggestions", qustions);
        obj.put("Q3Answer", "alt2");

        ///////////////fråga4///////////
        qustions = new JSONArray();

        qustions.add("10%");
        qustions.add("7%");
        qustions.add("20%");
        qustions.add("no answer");

        obj.put("Q4", "Hur store del av undervisningen innehåller projekt?");
        obj.put("Q4Suggestions", qustions);
        obj.put("Q4Answer", "alt3");

        ///////////////fråga5///////////
        qustions = new JSONArray();


        qustions.add("5%");
        qustions.add("9%");
        qustions.add("11%");
        qustions.add("no answer");

        obj.put("Q5", "Hur store del av undervisningen innehåller valbar kurs?");
        obj.put("Q5Suggestions", qustions);
        obj.put("Q5Answer", "alt2");

        System.out.println(new File("myJSON.json").getAbsolutePath());
        FileWriter file = new FileWriter("myJSON.json");

        file.write(obj.toString());
        file.flush();
    }
}
